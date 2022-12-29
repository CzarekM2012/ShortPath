import {Injectable, OnDestroy} from '@angular/core';
import * as assert from 'assert';
import {UndirectedGraph} from 'graphology';
import {countConnectedComponents} from 'graphology-components';
import {complete} from 'graphology-generators/classic';
import {Subscription} from 'rxjs';
import {Coordinates} from 'sigma/types';

import {graphAlgorithms} from '../../algorithms/register';
import {analyzeAlgorithmChange, maxEdgesForConnectedGraph, minEdgesForConnectedGraph} from '../../utility/functions';
import {globalSettings} from '../../utility/globalSettings';
import {AttributeDescriptor, ElementDescriptor} from '../../utility/types';
import {ChangeEmitterService} from '../change-emitter/change-emitter.service';

const INITIAL_LABEL = String.fromCharCode('A'.charCodeAt(0) - 1);
const IMPROPER_ALGORITHM = 'none';
const ELEMENT_SIZE = 5;

@Injectable({providedIn: 'root'})
export class GraphStorageService implements OnDestroy {
  private lastNode:
      {key: string, label: string} = {key: '-1', label: INITIAL_LABEL};
  private choosenAlgorithm: string = IMPROPER_ALGORITHM;
  graph: UndirectedGraph = new UndirectedGraph();
  pathEnds: {startNode?: string, endNode?: string} = {};
  subscriptions = new Subscription();

  constructor(private changeEmitter: ChangeEmitterService) {
    changeEmitter.graphElementAttributeChange.subscribe(
        ({element, attribute}) => {
          if (element.type == 'edge' &&
              attribute == graphAlgorithms[this.choosenAlgorithm].edgesLabel) {
            const newEdgeLabel =
                this.graph.getEdgeAttribute(element.key, attribute);
            this.graph.setEdgeAttribute(element.key, 'label', newEdgeLabel);
          };
        });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getChoosenAlgorithm() {
    return this.choosenAlgorithm;
  }

  changeAlgorithm(algorithm: string) {
    if (!(algorithm in graphAlgorithms) || algorithm == this.choosenAlgorithm)
      return;
    const propertyChanges =
        analyzeAlgorithmChange(this.choosenAlgorithm, algorithm);
    const edgeSets =
        propertyChanges.edges.add.concat(propertyChanges.edges.replace);
    const nodeSets =
        propertyChanges.nodes.add.concat(propertyChanges.nodes.replace);

    this.graph.forEachEdge((edgeKey: string) => {
      propertyChanges.edges.remove.forEach((desc) => {
        this.graph.removeEdgeAttribute(edgeKey, desc.name);
      });
      edgeSets.forEach((desc) => {
        this.graph.setEdgeAttribute(edgeKey, desc.name, desc.defaultValue);
      });
    });

    this.graph.forEachNode((nodeKey: string) => {
      propertyChanges.nodes.remove.forEach((desc) => {
        this.graph.removeNodeAttribute(nodeKey, desc.name);
      });
      nodeSets.forEach((desc) => {
        this.graph.setNodeAttribute(nodeKey, desc.name, desc.defaultValue);
      });
    });

    let currentEdgeLabel: string|undefined = undefined;
    if (this.choosenAlgorithm in graphAlgorithms) {
      currentEdgeLabel = graphAlgorithms[this.choosenAlgorithm].edgesLabel;
    }
    const newEdgeLabel = graphAlgorithms[algorithm].edgesLabel;
    if (currentEdgeLabel !== undefined && newEdgeLabel === undefined) {
      this.graph.forEachEdge((edgeKey) => {
        this.graph.removeEdgeAttribute(edgeKey, 'label');
      });
    }
    this.choosenAlgorithm = algorithm;
    this.refreshLabels();
  }

  addNode(coords: Coordinates): void {
    if (this.graph.order >= globalSettings.graphMaxNodes) {
      alert(
          `For the sake of readability of the nodes data display, number of nodes in the graph is limited to ${
              globalSettings.graphMaxNodes}.`);
      return;
    }

    let attributes: Record<string, any> = {
      ...coords,
      size: ELEMENT_SIZE,
      label: this.nextLabel(),
    };
    if (this.choosenAlgorithm in graphAlgorithms) {
      const algorithm = graphAlgorithms[this.choosenAlgorithm];
      algorithm.nodeProperties.forEach((descriptor) => {
        attributes[descriptor.name] = descriptor.defaultValue;
      });
    }
    const nodeKey = (Number(this.lastNode.key) + 1).toString();
    this.graph.addNode(nodeKey, attributes);
    this.changeEmitter.graphElementAdded.next(
        new ElementDescriptor(nodeKey, 'node'));
    this.lastNode.key = nodeKey;
  }

  addEdge(nodeKey1: string, nodeKey2: string): void {
    if (!this.graph.hasNode(nodeKey1) || !this.graph.hasNode(nodeKey2) ||
        this.graph.hasEdge(nodeKey1, nodeKey2) ||
        this.graph.hasEdge(nodeKey2, nodeKey1))
      return;

    let attributes: Record<string, any> = {'size': ELEMENT_SIZE};
    if (this.choosenAlgorithm in graphAlgorithms) {
      let labelValue: any = undefined;
      const algorithm = graphAlgorithms[this.choosenAlgorithm];
      algorithm.edgeProperties.forEach((descriptor) => {
        attributes[descriptor.name] = descriptor.defaultValue;
        if (descriptor.name == algorithm.edgesLabel)
          labelValue = descriptor.defaultValue;
      });
      if (labelValue !== undefined) attributes['label'] = labelValue;
    }
    this.graph.addEdge(nodeKey1, nodeKey2, attributes);
    this.changeEmitter.graphElementAdded.next(
        new ElementDescriptor(this.graph.edge(nodeKey1, nodeKey2)!, 'edge'));
  }

  removeNode(nodeKey: string): void {
    if (this.pathEnds.startNode == nodeKey) this.pathEnds.startNode = undefined;
    if (this.pathEnds.endNode == nodeKey) this.pathEnds.endNode = undefined;
    const connectedEdges = this.graph.edges(nodeKey);
    this.graph.dropNode(nodeKey);
    this.changeEmitter.graphElementRemoved.next(
        new ElementDescriptor(nodeKey, 'node'));
    connectedEdges.forEach((edgeKey) => {
      this.changeEmitter.graphElementRemoved.next(
          new ElementDescriptor(edgeKey, 'edge'));
    });
  }

  removeEdge(edgeKey: string): void {
    this.graph.dropEdge(edgeKey);
    this.changeEmitter.graphElementRemoved.next(
        new ElementDescriptor(edgeKey, 'edge'));
  }

  randomGraph(nodes: number, edges: number): void {
    assert(
        edges <= maxEdgesForConnectedGraph(nodes),
        'Given number of edges is higher than maximum number of edges for \
graph with given number of nodes');
    assert(
        edges >= minEdgesForConnectedGraph(nodes),
        'Given number of edges is lower than minimum number of edges for \
graph with given number of nodes');
    this.changeEmitter.graphElementRemoved.next('all');
    this.graph = complete(UndirectedGraph, nodes);
    // nodes from `complete` generator have numeric keys from range [0,
    // number_of_nodes)
    this.lastNode.key = (nodes - 1).toString();
    this.lastNode.label = INITIAL_LABEL;
    this.removeEdgesPreservingConnectedness(this.graph.size - edges);

    let nodesProperties: AttributeDescriptor[] = [];
    let edgesProperties: AttributeDescriptor[] = [];
    let edgeLabelAttribute: string|undefined = undefined;
    if (this.choosenAlgorithm in graphAlgorithms) {
      nodesProperties = graphAlgorithms[this.choosenAlgorithm].nodeProperties;
      edgesProperties = graphAlgorithms[this.choosenAlgorithm].edgeProperties;
      edgeLabelAttribute = graphAlgorithms[this.choosenAlgorithm].edgesLabel;
    }

    const nodesAttributes: Record < string, any >= {size: ELEMENT_SIZE};
    nodesProperties.forEach((descriptor) => {
      nodesAttributes[descriptor.name] = descriptor.defaultValue;
    });
    this.graph.forEachNode((node) => {
      this.graph.mergeNodeAttributes(
          node, {...nodesAttributes, label: this.nextLabel()});
    });

    const edgesAttributes: Record < string, any >= {size: ELEMENT_SIZE};
    edgesProperties.forEach((descriptor) => {
      edgesAttributes[descriptor.name] = descriptor.defaultValue;
      if (descriptor.name == edgeLabelAttribute)
        edgesAttributes['label'] = descriptor.defaultValue;
    });
    this.graph.forEachEdge((edge) => {
      this.graph.mergeEdgeAttributes(edge, edgesAttributes);
    });
    this.changeEmitter.graphElementAdded.next('all');
  }


  /**
   * Removes edges from stored graph in such a way that it remains connected.
   * Method assumes that this operation is possible, checks for passed values
   * need to be made before calling it.
   * @param removedEdges Number of edges that should be removed
   */
  private removeEdgesPreservingConnectedness(removedEdges: number) {
    let edgesKeys = this.graph.edges();
    // remove random edges from graph until it has number of edges equal to
    // one given to function
    while (removedEdges > 0) {
      let edgeIndex = Math.floor(Math.random() * (edgesKeys.length));
      const edge = edgesKeys[edgeIndex];
      edgesKeys.splice(edgeIndex, 1);
      const ends = this.graph.extremities(edge);
      this.graph.dropEdge(edge);
      if (countConnectedComponents(this.graph) == 1)
        removedEdges--;
      else  // removing edge disconnected the graph, re-add it
        this.graph.addEdge(ends[0], ends[1]);
    }
  }

  setPathEnd(nodeKey: string, type: 'start'|'end') {
    if (!this.graph.hasNode(nodeKey))
      console.error(
          'There is no node associated with key passed ' +
          'while trying to mark an end of the path');
    if (type == 'start') {
      if (this.pathEnds.startNode !== undefined)
        this.graph.removeNodeAttribute(this.pathEnds.startNode, 'color');
      this.graph.setNodeAttribute(nodeKey, 'color', 'blue');
      this.pathEnds.startNode = nodeKey;
      return;
    }
    if (this.pathEnds.endNode !== undefined)
      this.graph.removeNodeAttribute(this.pathEnds.endNode, 'color');
    this.graph.setNodeAttribute(nodeKey, 'color', 'red');
    this.pathEnds.endNode = nodeKey;
  }

  refreshLabels() {
    if (!(this.choosenAlgorithm in graphAlgorithms)) return;
    const edgeLabel = graphAlgorithms[this.choosenAlgorithm].edgesLabel;
    if (edgeLabel !== undefined) {
      this.graph.forEachEdge((edgeKey) => {
        this.graph.setEdgeAttribute(
            edgeKey, 'label', this.graph.getEdgeAttribute(edgeKey, edgeLabel));
      });
    }
  }

  private nextLabel(): string {
    const newLabelCharCode = this.lastNode.label.charCodeAt(0) + 1;
    const lastCharCode = 'Z'.charCodeAt(0);
    const charactersCount = lastCharCode - 'A'.charCodeAt(0) + 1;
    if (newLabelCharCode <= lastCharCode ||
        this.graph.order >= charactersCount) {
      this.lastNode.label = String.fromCharCode(newLabelCharCode);
      return this.lastNode.label;
    }
    // We already used last character as label and need to assign next, the
    // number of nodes is low enough to reassign labels
    this.reassignLabels();
    return this.nextLabel();
  }

  private reassignLabels() {
    this.lastNode.label = INITIAL_LABEL;
    const labelChanges: string[] = [];
    this.graph.forEachNode((node) => {
      this.graph.setNodeAttribute(node, 'label', this.nextLabel());
      labelChanges.push(node);
    });
    this.changeEmitter.graphNodesLabelChange.next(labelChanges);
    return this.nextLabel();
  }
}
