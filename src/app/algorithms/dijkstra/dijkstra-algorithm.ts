import {UndirectedGraph} from 'graphology';

import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';

export function dijkstra(
    executionStack: ExecutionStage[], graph: UndirectedGraph, source: string,
    destination: string) {
  let stage = new ExecutionStage();
  stage.description =
      'Starting node is set as current node and its distance from the start is set to 0. All nodes are considered to be unvisited.'
  stage.addChange(
      GraphChange.markElement(graph, {key: source, type: 'node'}, 'inspect'));
  stage.addChange(GraphChange.setProperty(
      graph, {key: source, type: 'node'}, 'distance', 0));
  executionStack.push(stage);
  let unvisited = graph.nodes();
  let current = source;
  while (current != destination) {
    stage = new ExecutionStage()
    stage.description =
        'Edge connecting current node with one of its unvisited neighbors is inspected. If sum of distance of current node and length of the edge is lower than current distance of neighbor node, distance of neighbor node is set to sum.';
    graph.forEachNeighbor(current, (neighbor: string) => {
      if (unvisited.includes(neighbor)) {
        stage.addChange(GraphChange.markElement(
            graph, {key: graph.edge(current, neighbor) as string, type: 'edge'},
            'inspect'));
        const distance = graph.getNodeAttribute(current, 'distance') +
            graph.getEdgeAttribute(current, neighbor, 'cost');
        if (distance < graph.getNodeAttribute(neighbor, 'distance'))
          stage.addChange(GraphChange.setProperty(
              graph, {key: neighbor, type: 'node'}, 'distance', distance));
        executionStack.push(stage);
        stage = new ExecutionStage();
        stage.description =
            'Edge connecting current node with one of its unvisited neighbors is inspected. If sum of distance of current node and length of the edge is lower than current distance of neighbor node, distance of neighbor node is set to sum.';
        stage.addChange(GraphChange.markElement(
            graph, {key: graph.edge(current, neighbor) as string, type: 'edge'},
            'reject'));
      }
    });
    stage.description =
        'All of edges leading to unvisited neighbours have been inspected and it is considered as visited. Unvisited node with lowest distance from start is choosen as new current node.';
    stage.addChange(
        GraphChange.markElement(graph, {key: current, type: 'node'}, 'reject'));
    const currentIndex = unvisited.indexOf(current);
    unvisited.splice(currentIndex, 1);
    unvisited.sort((a: string, b: string) => {
      const aDistance = graph.getNodeAttribute(a, 'distance');
      const bDistance = graph.getNodeAttribute(b, 'distance');
      if (aDistance < bDistance) return -1;
      if (aDistance > bDistance) return 1;
      return 0;
    });
    current = unvisited[0];
    stage.addChange(GraphChange.markElement(
        graph, {key: current, type: 'node'}, 'inspect'));
    executionStack.push(stage);
  }
  // find path and post last stage marking it
  stage = new ExecutionStage()
  stage.description =
      'Destination node has been choosen as current, which means that shortest path to it from start has been found.On the other ends of all uninspected edges leaving destination node lead to nodes that are farther from the start than it is. If algorithm were to continue beyond this point, shortest paths from start to all still unvisited points would be found.';
  while (current != source) {
    stage.addChange(GraphChange.markElement(
        graph, {key: current, type: 'node'}, 'approve'));
    const nextNode = graph.findNeighbor(
        current,
        (neighbor, attributes) => {
            return graph.getEdgeAttribute(
                       graph.edge(current, neighbor), 'cost') +
                attributes['distance'] ==
            graph.getNodeAttribute(current, 'distance')});
    stage.addChange(GraphChange.markElement(
        graph, {key: graph.edge(current, nextNode) as string, type: 'edge'},
        'approve'));
    current = nextNode as string;
  }
  stage.addChange(
      GraphChange.markElement(graph, {key: current, type: 'node'}, 'approve'));
  executionStack.push(stage);
};
