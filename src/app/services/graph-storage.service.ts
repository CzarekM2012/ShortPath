import {Injectable} from '@angular/core';
import * as assert from 'assert';
import {UndirectedGraph} from 'graphology';
import {countConnectedComponents} from 'graphology-components';
import {complete} from 'graphology-generators/classic';
import {Coordinates} from 'sigma/types';

@Injectable({providedIn: 'root'})
export class GraphStorageService {
  graph: UndirectedGraph = new UndirectedGraph();
  newNodeKey: string = '0';

  constructor() {}

  isValid(): boolean {
    // Doesn't detect singular disconnected nodes
    return countConnectedComponents(this.graph) == 1;  // is connected
  }

  addNode(coords: Coordinates): void {
    this.graph.addNode(this.newNodeKey, {...coords});
    this.newNodeKey = (parseInt(this.newNodeKey) + 1).toString();
  }

  removeNode(nodeKey: string): void {
    this.graph.dropNode(nodeKey);
  }

  addEdge(nodeKey1: string, nodeKey2: string): void {
    if (this.graph.hasNode(nodeKey1) && this.graph.hasNode(nodeKey2) &&
        !(this.graph.hasEdge(nodeKey1, nodeKey2) ||
          this.graph.hasEdge(nodeKey2, nodeKey1)))
      this.graph.addEdge(nodeKey1, nodeKey2, {'cost': 1});
  }

  removeEdge(edgeKey: string): void {
    this.graph.dropEdge(edgeKey);
  }

  randomGraph(nodes: number, edges: number): void {
    assert(
        edges <= nodes * (nodes - 1) / 2,
        'Given number of edges is higher than maximum number of edges for \
graph with given number of nodes');
    assert(
        edges > nodes - 1,
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

    // create cost field that can be edited by user in info display
    for (const edgeKey of this.graph.edges()) {
      this.graph.setEdgeAttribute(edgeKey, 'cost', 1);
    }

    // for easier testing of display, nodes are easier to click
    for (const nodeKey of this.graph.nodes()) {
      this.graph.setNodeAttribute(nodeKey, 'test', 13);
    }
  }
}
