import {Injectable} from '@angular/core';
import * as assert from 'assert';
import {UndirectedGraph} from 'graphology';
import {countConnectedComponents} from 'graphology-components';
import {complete} from 'graphology-generators/classic';
import {Coordinates} from 'sigma/types';

import {graphAlgorithms} from '../../algorithms/register';
import {analyzeAlgorithmChange, maxEdgesForConnectedGraph, minEdgesForConnectedGraph} from '../../utility/functions';
import {ChangeEmitterService} from '../change-emitter/change-emitter.service';
import {GlobalSettingsService} from '../global-settings/global-settings.service';

const INITIAL_LABEL = String.fromCharCode('A'.charCodeAt(0));
const IMPROPER_ALGORITHM = 'none';
const ELEMENT_SIZE = 5;

@Injectable({providedIn: 'root'})
export class GraphStorageService {
  graph: UndirectedGraph = new UndirectedGraph();
  _lastNode: {key: string, label: string} = {key: '-1', label: INITIAL_LABEL};
  choosenAlgorithm: string = IMPROPER_ALGORITHM;
  pathEnds: {startNode?: string, endNode?: string} = {};

  constructor(
      private globalSettings: GlobalSettingsService,
      private changeEmitter: ChangeEmitterService) {}

  isValid(): boolean {
    // Doesn't detect singular disconnected nodes
    return countConnectedComponents(this.graph) == 1;  // is connected
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
    if (this.graph.order >= this.globalSettings.maxGraphNodes) {
      alert(
          `For the sake of readability of the nodes data display, number of nodes in the graph is limited to ${
              this.globalSettings.maxGraphNodes}.`);
      return;
    }

    let attributes: Record<string, any> = {
      ...coords,
      size: ELEMENT_SIZE,
      label: this._nextLabel()
    };
    if (this.choosenAlgorithm in graphAlgorithms) {
      const algorithm = graphAlgorithms[this.choosenAlgorithm];
      algorithm.nodeProperties.forEach((descriptor) => {
        attributes[descriptor.name] = descriptor.defaultValue;
      });
    }
    const nodeKey = (Number(this._lastNode.key) + 1).toString();
    this.graph.addNode(nodeKey, attributes);
    this._lastNode.key = nodeKey;
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
  }

  removeNode(nodeKey: string): void {
    this.graph.dropNode(nodeKey);
  }

  removeEdge(edgeKey: string): void {
    this.graph.dropEdge(edgeKey);
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
    this.graph = complete(UndirectedGraph, nodes);
    // nodes from `complete` generator have numeric keys from range [0,
    // number_of_nodes)
    this._lastNode.key = (nodes - 1).toString();
    this._lastNode.label = INITIAL_LABEL;
    this.graph.forEachNode((node) => {
      this.graph.mergeNodeAttributes(
          node, {size: ELEMENT_SIZE, label: this._nextLabel()});
    });

    let edgesKeys = this.graph.edges();
    let edgeCount = edgesKeys.length;
    // remove random edges from graph until it has number of edges equal to
    // one given to function
    while (edgeCount > edges) {
      let edgeIndex = Math.floor(Math.random() * (edgesKeys.length));
      const edge = edgesKeys[edgeIndex];
      edgesKeys.splice(edgeIndex, 1);
      const ends = this.graph.extremities(edge);
      this.graph.dropEdge(edge);
      if (this.isValid())
        edgeCount--;
      else  // removing edge disconnected the graph, re-add it
        this.graph.addEdge(ends[0], ends[1]);
    }

    this.graph.forEachEdge((edge) => {
      this.graph.setEdgeAttribute(edge, 'size', ELEMENT_SIZE);
    });
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
    this.changeEmitter.graphRefresh();
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

  _nextLabel(): string {
    const newLabelCharCode = this._lastNode.label.charCodeAt(0) + 1;
    const lastCharCode = 'Z'.charCodeAt(0);
    const charactersCount = lastCharCode - 'A'.charCodeAt(0) + 1;
    if (newLabelCharCode <= lastCharCode ||
        this.graph.order >= charactersCount) {
      this._lastNode.label = String.fromCharCode(newLabelCharCode);
      return this._lastNode.label;
    }
    this._lastNode.label = INITIAL_LABEL;
    this.graph.forEachNode((node) => {
      this.graph.setNodeAttribute(node, 'label', this._nextLabel());
    });
    // TODO: notify of labels change
    return this._nextLabel();
  }
}
