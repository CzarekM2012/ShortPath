import {UndirectedGraph} from 'graphology';

import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {firstCharCap} from '../../utility/graphFunctions';
import {ElementDescriptor} from '../../utility/types';

const DIST = 'dist';
const COST = 'cost';

export const dijkstraStrings = {
  descriptions: {
    general:
        `One of the most widely known algorithms for finding the shortest ` +
        `path between nodes in a graph. It can be used find shortest paths ` +
        `between choosen source node and all other nodes in the graph.
Algorithm keeps a list of nodes paired with lengths of shortest found paths ` +
        `leading to them. Main loop of the algorithm chooses node associated ` +
        `with the shortest path on the list, starting from source node.` +
        `Record for choosen node is removed from the list. Lengths of paths ` +
        `leading through choosen node to its neighbours are calculated. If ` +
        `lengths of paths leading to these nodes were unknown or larger than ` +
        `newly calculated, they are updated.
Main loop of the algorithm is repeated until the list is empty or destination ` +
        `node has been removed from it, depending on usage of the algorithm. [1]`,
    history:
        `This algorithm has been created by Dutch computer scientist Edsger ` +
        `W. Dijkstra. It was conceived in 1956 in order to present the ` +
        `capabilities of new computer ARMAC [2], created by the Mathematical ` +
        `Center in Amsterdam, where Dijkstra was working at the time. It got ` +
        `published in 1959. In one of his last inverviews, Dijkstra spoke about ` +
        `the circumstances of its creation.

“What’s the shortest way to travel from Rotterdam to Groningen, in ` +
        `general: from given city to given city. It is the algorithm for the ` +
        `shortest path, which I designed in about twenty minutes. One morning I ` +
        `was shopping in Amsterdam with my young fiancée, and tired, we sat down ` +
        `on the café terrace to drink a cup of coffee and I was just thinking ` +
        `about whether I could do this, and I then designed the algorithm for ` +
        `the shortest path. As I said, it was a twenty-minute invention. In ` +
        `fact, it was published in ’59, three years late. The publication is ` +
        `still readable, it is, in fact, quite nice. One of the reasons that it ` +
        `is so nice was that I designed it without pencil and paper. I learned ` +
        `later that one of the advantages of designing without pencil and paper ` +
        `is that you are almost forced to avoid all avoidable complexities. ` +
        `Eventually that algorithm became, to my great amazement, one of the ` +
        `cornerstones of my fame. I found it in the early ’60’s in a German book ` +
        `on management science - - “Das Dijkstra’sche Verfahren.” Suddenly, ` +
        `there was a method named after me.” [3]`,
    pseudocode: `Deferred until implementation of predecessor tracking`,
    attributesDefinitions: {
      nodes: {
        [DIST]: 'Length of the shortest path between the node and the ' +
            'starting node, can not be changed.'
      },
      edges: {
        [COST]: 'Length of the edge, can be changed, needs to be a positive ' +
            'number, marked on graph visualisation.'
      }
    },
    references:
        `[1] E. W. Dijkstra, “A note on two problems in connexion with graphs”, Numerische Mathematik, t. 1, nr. 1, s. 269–271, 1959, ISSN: 0945-3245. DOI: 10.1007/BF01386390. adr.: https://doi.org/10.1007/BF01386390.
[2] “ARMAC | Unsung Heroes in Dutch Computing History”, Accessed (31.12.2022): https://web.archive.org/web/20131113021126/http://www-set.win.tue.nl/UnsungHeroes/machines/armac.html, 2013.
[3] E. W. Dijkstra, Oral history interview with Edsger W. Dijkstra, Accessed (31.12.2022): http://purl.umn.edu/96226, 2001.`
  },
  nodesAttributes: {distance: DIST},
  edgesAttributes: {cost: COST},
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
