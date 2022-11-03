import {Injectable} from '@angular/core';
import * as assert from 'assert';
import {UndirectedGraph} from 'graphology';
import {countConnectedComponents} from 'graphology-components';
import {complete} from 'graphology-generators/classic';

@Injectable({providedIn: 'root'})
export class GraphStorageService {
  graph: UndirectedGraph = new UndirectedGraph();

  constructor() {
    this.graph = GraphStorageService.randomGraph(15, 70);
  }

  static isValid(graph: UndirectedGraph): boolean {
    return countConnectedComponents(graph) == 1;  // is connected
  }

  static randomGraph(nodes: number, edges: number): UndirectedGraph {
    assert(
        edges <= nodes * (nodes - 1) / 2,
        'Given number of edges is higher than maximum number of edges for \
graph with given number of nodes');
    assert(
        edges > nodes - 1,
        'Given number of edges is lower than minimum number of edges for \
graph with given number of nodes');
    let graph = complete(UndirectedGraph, nodes);

    let edgesKeys = graph.edges();
    let edgeCount = edgesKeys.length;
    // remove random edges from graph until it has number of edges equal to one
    // given to function
    while (edgeCount > edges) {
      let edgeIndex = Math.floor(Math.random() * (edgesKeys.length));
      const edge = edgesKeys[edgeIndex];
      edgesKeys.splice(edgeIndex, 1);
      const ends = graph.extremities(edge);
      graph.dropEdge(edge);
      if (GraphStorageService.isValid(graph))
        edgeCount--;
      else  // removing edge disconnected the graph, re-add it
        graph.addEdge(ends[0], ends[1]);
    }
    return graph;
  }
}
