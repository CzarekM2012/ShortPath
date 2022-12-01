import {EventEmitter, Injectable} from '@angular/core';
import * as assert from 'assert';
import {UndirectedGraph} from 'graphology';
import {countConnectedComponents} from 'graphology-components';
import {complete} from 'graphology-generators/classic';
import {Coordinates} from 'sigma/types';

import {graphAlgorithms} from '../../algorithms/register';
import {analyzeAlgorithmChange, maxEdgesForConnectedGraph, minEdgesForConnectedGraph} from '../../utility/functions';

const IMPROPER_ALGORITHM = 'none';

@Injectable({providedIn: 'root'})
export class GraphStorageService {
  graph: UndirectedGraph = new UndirectedGraph();
  newNodeKey: string = '0';
  choosenAlgorithm: string = IMPROPER_ALGORITHM
  startNode?: string;
  endNode?: string;
  graphicRefresh = new EventEmitter(true);

  constructor() {}

  isValid(): boolean {
    // Doesn't detect singular disconnected nodes
    return countConnectedComponents(this.graph) == 1;  // is connected
  }

  changeAlgorithm(algorithm: string) {
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
        this.graph.setEdgeAttribute(edgeKey, desc.name, desc.default);
      });
    });

    this.graph.forEachNode((nodeKey: string) => {
      propertyChanges.nodes.remove.forEach((desc) => {
        this.graph.removeNodeAttribute(nodeKey, desc.name);
      });
      nodeSets.forEach((desc) => {
        this.graph.setNodeAttribute(nodeKey, desc.name, desc.default);
      });
    });

    this.choosenAlgorithm = algorithm;
  }

  addNode(coords: Coordinates): void {
    this.graph.addNode(this.newNodeKey, {...coords});
    // Newly added node has no algorithm-specific attributes so all of them
    // should be added
    graphAlgorithms[this.choosenAlgorithm]?.nodeProperties.forEach(
        (descriptor) => {
          this.graph.setNodeAttribute(
              this.newNodeKey, descriptor.name, descriptor.default);
        });
    this.newNodeKey = (parseInt(this.newNodeKey) + 1).toString();
  }

  addEdge(nodeKey1: string, nodeKey2: string): void {
    if (this.graph.hasNode(nodeKey1) && this.graph.hasNode(nodeKey2) &&
        !(this.graph.hasEdge(nodeKey1, nodeKey2) ||
          this.graph.hasEdge(nodeKey2, nodeKey1))) {
      this.graph.addEdge(nodeKey1, nodeKey2);
      // Newly added edge has no algorithm-specific attributes so all of them
      // should be added
      graphAlgorithms[this.choosenAlgorithm]?.edgeProperties.forEach(
          (descriptor) => {
            this.graph.setEdgeAttribute(
                nodeKey1, nodeKey2, descriptor.name, descriptor.default);
          });
    }
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
    this.newNodeKey = nodes.toString();

    let edgesKeys = this.graph.edges();
    let edgeCount = edgesKeys.length;
    // remove random edges from graph until it has number of edges equal to one
    // given to function
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
  }

  setPathEnd(nodeKey: string, type: 'start'|'end') {
    if (!this.graph.hasNode(nodeKey))
      console.error(
          'There is no node associated with key passed ' +
          'while trying to mark an end of the path');
    if (type == 'start') {
      if (this.startNode !== undefined)
        this.graph.removeNodeAttribute(this.startNode, 'color');
      this.graph.setNodeAttribute(nodeKey, 'color', 'blue');
      this.startNode = nodeKey;
      return;
    }
    if (this.endNode !== undefined)
      this.graph.removeNodeAttribute(this.endNode, 'color');
    this.graph.setNodeAttribute(nodeKey, 'color', 'red');
    this.endNode = nodeKey;
    this.triggerGraphicRefresh();
  }

  triggerGraphicRefresh() {
    this.graphicRefresh.emit();
  }
}
