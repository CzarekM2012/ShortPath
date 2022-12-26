import {UndirectedGraph} from 'graphology';

import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {ElementDescriptor} from '../../utility/types';

const DIST = 'distance';
const COST = 'cost';
const DESCRIPTION =
    'One of the most widely known algorithms for finding the shortest ' +
    'path between nodes in a graph. Works by separating nodes of the ' +
    'graph into two sets: visited (initially empty) and unvisited ' +
    '(initially all nodes). Nodes from unvisited set are inspected one ' +
    'by one and moved to the visited set until the destination node is ' +
    'encountered.\n\n' +
    `Each node of the graph is assigned attribute "${DIST}", its value ` +
    'is equal to the length of the shortest path between the node and ' +
    'the starting node.\nEach edge of the graph is assigned attribute ' +
    `"${COST}", its value describes length of the edge.\nCosts of the ` +
    'specific edges will also be written directly on the graph ' +
    'visualisation.\n\n' +
    'Costs of edges of the graph are required to be positive.';

export const dijkstraConsts = {
  description: DESCRIPTION,
  nDistName: DIST,
  eCostName: COST,
};

type nodeData = {
  key: string,
  dist: number,
  label: string,
};

export function dijkstraAlgorithm(
    graph: UndirectedGraph, source: string, destination: string,
    submitStage: (stage: ExecutionStage) => void) {
  const sourceLabel = graph.getNodeAttribute(source, 'label');
  let stage = new ExecutionStage();
  stage.addChange(GraphChange.markElement(
      graph, new ElementDescriptor(source, 'node'), 'inspect'));
  stage.addChange(GraphChange.setProperty(
      graph, new ElementDescriptor(source, 'node'), DIST, 0));
  stage.description = `Starting node (${
      sourceLabel}) is set as the current node, its ${DIST} is set to 0.
      All nodes are considered to be unvisited.
      Since paths leading nodes other than the starting one are unknown, their ${
      DIST} is set to Infinity.`
  submitStage(stage);
  let unvisited = graph.nodes();
  let current: nodeData = {
    key: source,
    dist: graph.getNodeAttribute(source, DIST),
    label: graph.getNodeAttribute(source, 'label'),
  };
  while (current.key != destination) {
    stage = new ExecutionStage()
    graph.forEachNeighbor(current.key, (neighbourKey: string) => {
      if (unvisited.includes(neighbourKey)) {
        const neighbour: nodeData = {
          key: neighbourKey,
          dist: graph.getNodeAttribute(neighbourKey, DIST),
          label: graph.getNodeAttribute(neighbourKey, 'label'),
        };
        const edge = graph.edge(current.key, neighbour.key) as string;
        const edgeCost = graph.getEdgeAttribute(edge, COST);
        const neighbourNewDistance = current.dist + edgeCost;
        stage.addChange(GraphChange.markElement(
            graph, new ElementDescriptor(edge, 'edge'), 'inspect'));
        stage.description = `Edge connecting the current node (${
            current.label}) with its unvisited neighbour (${
            neighbour.label}) is inspected.\n`;
        if (neighbourNewDistance < neighbour.dist) {
          stage.addChange(GraphChange.setProperty(
              graph, new ElementDescriptor(neighbour.key, 'node'), DIST,
              neighbourNewDistance));
          stage.description += `Sum of the ${DIST} of ${
              current.label} and the ${COST} of the edge ${current.label}${
              neighbour.label} (${current.dist} + ${edgeCost} = ${
              neighbourNewDistance}) is lower than the ${DIST} of ${
              neighbour.label} (${neighbour.dist}).
              It means that using edge ${current.label}${
              neighbour.label} creates a shorter path from ${sourceLabel} to ${
              neighbour.label}.
              ${DIST} of ${neighbour.label} is set to ${neighbourNewDistance}.`
        } else {
          stage.description += `Sum of the ${DIST} of ${
              current.label} and the ${COST} of the edge ${current.label}${
              neighbour.label} (${current.dist} + ${edgeCost} = ${
              neighbourNewDistance}) is higher than or equal to the ${
              DIST} of ${neighbour.label} (${neighbour.dist}).
              It means that using edge ${current.label}-${
              neighbour.label} does not create a shorter path from ${
              sourceLabel} to ${neighbour.label}.
              Value of ${DIST} of ${neighbour.label} does not change.`
        }
        submitStage(stage);
        stage = new ExecutionStage();
        stage.addChange(GraphChange.markElement(
            graph, new ElementDescriptor(edge, 'edge'), 'reject'));
      }
    });
    stage.addChange(GraphChange.markElement(
        graph, new ElementDescriptor(current.key, 'node'), 'reject'));
    const currentIndex = unvisited.indexOf(current.key);
    unvisited.splice(currentIndex, 1);
    unvisited.sort((a: string, b: string) => {
      const aDistance = graph.getNodeAttribute(a, DIST);
      const bDistance = graph.getNodeAttribute(b, DIST);
      return aDistance - bDistance;
    });
    const newCurrent: nodeData = {
      key: unvisited[0],
      dist: graph.getNodeAttribute(unvisited[0], DIST),
      label: graph.getNodeAttribute(unvisited[0], 'label'),
    };
    stage.addChange(GraphChange.markElement(
        graph, new ElementDescriptor(newCurrent.key, 'node'), 'inspect'));
    stage.description = `All of the edges connecting current node (${
        current.label}) with its unvisited neighbours have been inspected.
        ${current.label} is removed from the set of unvisited nodes.
        Unvisited node with the lowest ${DIST} (${
        newCurrent.label}) choosen as new current node.`;
    submitStage(stage);
    current = newCurrent;
  }
  // Find path and post last stage marking it
  stage = new ExecutionStage()
  const pathElements = readPath(graph, source, destination);
  pathElements.forEach((element) => {
    stage.addChange(GraphChange.markElement(graph, element, 'approve'));
  });
  const destinationLabel = graph.getNodeAttribute(destination, 'label');
  stage.description =
      `Destination node (${destinationLabel}) has been choosen as current.
      The shortest path from the starting node (${sourceLabel}) to ${
          destinationLabel} has been found.
      If algorithm were to continue until the set of unvisited nodes is empty, shortest paths from ${
          sourceLabel} to all nodes would be found.`;
  submitStage(stage);
}

function readPath(graph: UndirectedGraph, source: string, destination: string):
    ElementDescriptor[] {
  const pathElements: ElementDescriptor[] =
      [new ElementDescriptor(destination, 'node')];
  let current = destination;
  while (current != source) {
    const currentDist = graph.getNodeAttribute(current, DIST);
    // Find neighbour of current node that precedes it on the path
    // (currentDist == neighbourDist + currentNeighbourCost)
    const nextNode = graph.findNeighbor(current, (neighbour, attributes) => {
      const edge = graph.edge(current, neighbour);
      return graph.getEdgeAttribute(edge, COST) + attributes[DIST] ==
          currentDist
    }) as string;
    pathElements.push(new ElementDescriptor(nextNode, 'node'));
    const pathEdge = graph.edge(current, nextNode) as string;
    pathElements.push(new ElementDescriptor(pathEdge, 'edge'));
    current = nextNode;
  }
  return pathElements;
}
