import {UndirectedGraph} from 'graphology';

import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {firstCharCap} from '../../utility/graphFunctions';
import {ElementDescriptor} from '../../utility/types';

const DIST = 'dist';
const PRED_LABEL = 'pred';
const PRED_KEY = 'predKey';
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
    pseudocode:
        `// Read the path, by following predecessors of graph nodes starting
// from target.
function readPath(target, ${PRED_LABEL}):
   path := []
   current := target
   while current != UNDEFINED
      path.pushFront(current)
      current := ${PRED_LABEL}[current]
   return path


function Dijkstra(graph, source, target):
   // Step 1: Assign starting values of ${DIST} and ${
            PRED_LABEL} for each node in
   //         graph
   UnlabeledNodes := []
   for each node in graph.nodes:
      // Making ${DIST} and ${
            PRED_LABEL} data structures returning these starting
      // values when trying to access values for missing keys may reduce
      // the amount of required memory.
      ${DIST}[node] := INFINITY
      ${PRED_LABEL}[node] := UNDEFINED
      UnlabeledNodes.push(node)
   ${DIST}[source] := 0

   while UnlabeledNodes is not empty:
      current := node in UnlabeledNodes with min ${DIST}[node]
      if current == target:
         break
      // Step 2: Make ${DIST} and ${
            PRED_LABEL} of chosen node permanent. Update these
      //         values for each neighbour of chosen node, unless they were
      //         made permanent before.
      UnlabeledNodes.remove(current)
      for each neighbour of current in UnlabeledNodes:
         new${firstCharCap(DIST)} := ${DIST}[current] + ${
            COST}(current, neighbour)
         if new${firstCharCap(DIST)} < ${DIST}[neighbour]:
            ${DIST}[neighbour] := new${firstCharCap(DIST)}
            ${PRED_LABEL}[neighbour] := current
   return readPath(target, ${PRED_LABEL}) `,
    attributesDefinitions: {
      nodes: {
        [DIST]: 'Length of the shortest path between the node and the ' +
            'starting node, can not be changed.',
        [PRED_LABEL]: 'Node that precedes the node on the path, can not be ' +
            'changed.'
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
  nodesAttributes: {
    distance: DIST,
    predecessorLabel: PRED_LABEL,
    predecessorKey: PRED_KEY,
  },
  edgesAttributes: {cost: COST},
};

type NodeData = {
  desc: ElementDescriptor,
  dist: number,
  label: string,
};

type EdgeData = {
  desc: ElementDescriptor,
  cost: number,
};

export function dijkstraAlgorithm(
    graph: UndirectedGraph, source: string, destination: string,
    submitStage: (stage: ExecutionStage) => void) {
  const sourceData: NodeData = {
    desc: new ElementDescriptor(source, 'node'),
    dist: 0,
    label: graph.getNodeAttribute(source, 'label'),
  };

  let stage = new ExecutionStage();
  stage.addChange(GraphChange.markElement(graph, sourceData.desc, 'inspect'));
  stage.addChange(
      GraphChange.setProperty(graph, sourceData.desc, DIST, sourceData.dist));
  const startingNodePredecessorLabel = 'starting node - no predecessor';
  stage.addChange(GraphChange.setProperty(
      graph, sourceData.desc, PRED_LABEL, startingNodePredecessorLabel));
  stage.description =
      `Starting node (${sourceData.desc}) is set as the current node, its ${
          DIST} is set to ${sourceData.dist} and ${PRED_LABEL} - to "${
          startingNodePredecessorLabel}".
      All nodes are considered to be unvisited.
      Since paths leading nodes other than the starting one are unknown, their ${
          DIST} is set to Infinity and ${PRED_LABEL} - to "?".`
  submitStage(stage);
  let unvisited = graph.nodes();
  let current: NodeData = {
    desc: new ElementDescriptor(source, 'node'),
    dist: graph.getNodeAttribute(source, DIST),
    label: graph.getNodeAttribute(source, 'label'),
  };
  while (current.desc.key != destination) {
    stage = new ExecutionStage()
    graph.forEachNeighbor(current.desc.key, (neighbourKey: string) => {
      if (unvisited.includes(neighbourKey)) {
        const neighbour: NodeData = {
          desc: new ElementDescriptor(neighbourKey, 'node'),
          dist: graph.getNodeAttribute(neighbourKey, DIST),
          label: graph.getNodeAttribute(neighbourKey, 'label'),
        };
        const edgeKey = graph.edge(current.desc.key, neighbourKey) as string;
        const edge: EdgeData = {
          desc: new ElementDescriptor(edgeKey, 'edge'),
          cost: graph.getEdgeAttribute(edgeKey, COST),
        };
        const neighbourNewDist = current.dist + edge.cost;
        stage.addChange(GraphChange.markElement(graph, edge.desc, 'inspect'));
        stage.description = `Edge connecting the current node (${
            current.label}) with its unvisited neighbour (${
            neighbour.label}) is inspected. Length of path leading to ${
            neighbour.label} using it is equal to ${neighbourNewDist}`;

        if (neighbourNewDist < neighbour.dist) {
          stage.description += `Path from ${sourceData.label} to ${
              neighbour.label} using edge ${current.label}${
              neighbour.label} is shorter than previous path between ${
              sourceData.label} and ${neighbour.label}.
              "${firstCharCap(DIST)}" of ${
              neighbour.label} is set to the length new path (${
              neighbourNewDist})
              Node ${current.label} is set as "${PRED_LABEL}" of ${
              neighbour.label}.`

          neighbour.dist = neighbourNewDist;
          stage.addChange(...setPredecessor(graph, neighbour, current));
        } else {
          stage.description += `Path from ${sourceData.label} to ${
              neighbour.label} using edge ${current.label}${
              neighbour.label} is longer or equal to previous path between ${
              sourceData.label} and ${neighbour.label}.
              Values describing ${neighbour.label} remain unchanged.`
        }
        submitStage(stage);
        stage = new ExecutionStage();
        stage.addChange(GraphChange.markElement(graph, edge.desc, 'reject'));
      }
    });
    stage.addChange(GraphChange.markElement(graph, current.desc, 'reject'));

    const currentIndex = unvisited.indexOf(current.desc.key);
    unvisited.splice(currentIndex, 1);
    unvisited.sort((a: string, b: string) => {
      const aDistance = graph.getNodeAttribute(a, DIST);
      const bDistance = graph.getNodeAttribute(b, DIST);
      return aDistance - bDistance;
    });
    const newCurrent: NodeData = {
      desc: new ElementDescriptor(unvisited[0], 'node'),
      dist: graph.getNodeAttribute(unvisited[0], DIST),
      label: graph.getNodeAttribute(unvisited[0], 'label'),
    };
    stage.addChange(GraphChange.markElement(graph, newCurrent.desc, 'inspect'));
    stage.description = `All of the edges connecting current node (${
        current.label}) with its unvisited neighbours have been inspected.
        ${current.label} is removed from the set of unvisited nodes.
        Unvisited node with the lowest ${DIST} (${
        newCurrent.label}) choosen as new current node.
        The shortest path between ${sourceData.label} and ${
        newCurrent.label} has been found.`;
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
      The shortest path from the starting node (${sourceData.label}) to ${
          destinationLabel} has been found.
      If algorithm were to continue until the set of unvisited nodes is empty, shortest paths from ${
          sourceData.label} to all nodes would be found.`;
  submitStage(stage);
}

function setPredecessor(
    graph: UndirectedGraph, node: NodeData,
    newPredecessor: NodeData): GraphChange[] {
  const changes: GraphChange[] = [];
  changes.push(GraphChange.setProperty(graph, node.desc, DIST, node.dist));
  changes.push(GraphChange.setProperty(
      graph, node.desc, PRED_KEY, newPredecessor.desc.key));
  changes.push(GraphChange.setProperty(
      graph, node.desc, PRED_LABEL, newPredecessor.label));
  return changes;
}

function readPath(graph: UndirectedGraph, source: string, destination: string):
    ElementDescriptor[] {
  const pathElements: ElementDescriptor[] =
      [new ElementDescriptor(destination, 'node')];
  let current = destination;
  while (current != source) {
    const predecessor = graph.getNodeAttribute(current, PRED_KEY) as string;
    pathElements.push(new ElementDescriptor(predecessor, 'node'));
    const edge = graph.edge(current, predecessor) as string;
    pathElements.push(new ElementDescriptor(edge, 'edge'));
    current = predecessor;
  }
  return pathElements;
}
