import {UndirectedGraph} from 'graphology';
import {singleSourceLength} from 'graphology-shortest-path/unweighted';

import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {firstCharCap} from '../../utility/graphFunctions';
import {ElementDescriptor} from '../../utility/types';

const DIST = 'distance';
const HEUR = 'heuristic';
const PRED_LABEL = 'predecessor';
const PRED_KEY = 'predecessorKey';
const COST = 'cost';

type NodeData = {
  desc: ElementDescriptor,
  dist: number,
  heur: number,
  label: string,
};

type EdgeData = {
  desc: ElementDescriptor,
  cost: number,
};

function generalAStar(
    graph: UndirectedGraph, source: string, destination: string,
    submitStage: (stage: ExecutionStage) => void,
    heuristic: (graph: UndirectedGraph, node: string) => number) {
  const sourceData: NodeData = {
    desc: new ElementDescriptor(source, 'node'),
    dist: 0,
    heur: heuristic(graph, source),
    label: graph.getNodeAttribute(source, 'label'),
  };

  let stage = new ExecutionStage();
  stage.addChange(GraphChange.markElement(graph, sourceData.desc, 'inspect'));
  stage.addChange(
      GraphChange.setProperty(graph, sourceData.desc, DIST, sourceData.dist));
  stage.addChange(
      GraphChange.setProperty(graph, sourceData.desc, HEUR, sourceData.heur));
  const startingNodePredecessorLabel = 'starting node - no predecessor';
  stage.addChange(GraphChange.setProperty(
      graph, sourceData.desc, PRED_LABEL, startingNodePredecessorLabel));
  stage.description = `Starting node (${
      sourceData.label}) is the only node that can extend a path, its ${
      DIST} is set to ${sourceData.dist}, ${
      HEUR} - to the value of heuristic function (${sourceData.heur}), and ${
      PRED_LABEL} - to "${startingNodePredecessorLabel}".
          Since paths leading nodes other than the starting one are unknown, both their ${
      DIST} and ${HEUR} are set to "Infinity" and their ${PRED_LABEL} - to "?".`
  submitStage(stage);

  const availableNodes: NodeData[] = [{
    desc: new ElementDescriptor(source, 'node'),
    dist: graph.getNodeAttribute(source, DIST),
    heur: graph.getNodeAttribute(source, HEUR),
    label: graph.getNodeAttribute(source, 'label'),
  }];
  stage = new ExecutionStage();
  while (availableNodes.length > 0) {
    availableNodes.sort((a, b) => {return a.heur - b.heur});
    const current = availableNodes[0];
    availableNodes.splice(0, 1);

    const currentPredLabel =
        graph.getNodeAttribute(current.desc.key, PRED_LABEL);
    stage.addChange(GraphChange.markElement(graph, current.desc, 'inspect'));
    stage.description = `Node ${current.label} has the lowest value of ${
        HEUR} from the set of nodes that can extend a path.
        It extends the path leading through its predecessor (${
        currentPredLabel}), is choosen as current node and is removed from the set.`
    submitStage(stage);

    if (current.desc.key == destination) {
      stage = new ExecutionStage();
      const pathElements = readPath(graph, source, destination);
      const pathMarkings = pathElements.map((element) => {
        return GraphChange.markElement(graph, element, 'approve');
      })
      stage.addChange(...pathMarkings);
      const destinationLabel =
          graph.getNodeAttribute(destination, 'label') as string;
      stage.description =
          `Destination node (${destinationLabel}) has been choosen as current.
      The shortest path from the starting node (${sourceData.label}) to ${
              destinationLabel} has been found.`;
      submitStage(stage);
      return
    }

    stage = new ExecutionStage();
    graph.forEachNeighbor(current.desc.key, (neighbourKey) => {
      const edgeKey = graph.edge(current.desc.key, neighbourKey) as string;
      const edge: EdgeData = {
        desc: new ElementDescriptor(edgeKey, 'edge'),
        cost: graph.getEdgeAttribute(edgeKey, COST),
      };
      const neighbour: NodeData = {
        desc: new ElementDescriptor(neighbourKey, 'node'),
        dist: graph.getNodeAttribute(neighbourKey, DIST),
        heur: graph.getNodeAttribute(neighbourKey, HEUR),
        label: graph.getNodeAttribute(neighbourKey, 'label'),
      };
      const neighbourNewDist = current.dist + edge.cost

      stage.addChange(
          GraphChange.markElement(graph, neighbour.desc, 'inspect'));
      stage.addChange(GraphChange.markElement(graph, edge.desc, 'inspect'));
      stage.description = `Length of the shortest path from starting node (${
          sourceData.label}) to ${neighbour.label} through current node (${
          current.label}) equals ${neighbourNewDist}.\n`

      if (neighbourNewDist < neighbour.dist) {
        const neighbourNewHeur =
            neighbourNewDist + heuristic(graph, neighbour.desc.key);

        stage.description +=
            `This path is shorter than the current path from ` +
            `${sourceData.label} to ${neighbour.label} ` +
            `(${neighbourNewDist} < ${neighbour.dist}).
            "${firstCharCap(DIST)}" of ${neighbour.label} is set to the ` +
            `length of the shorter path (${neighbourNewDist}).
            "${firstCharCap(HEUR)}" of ${neighbour.label} is set to new ` +
            `approximation of length of the path from the starting node to ` +
            `the destination node (${neighbourNewHeur}).
            Node ${current.label} is set as "${PRED_LABEL}" of ${
                neighbour.label}.
            When ${neighbour.label} will be choosen as current node, it will ` +
            `extend path leading through ${current.label}, unless shorter ` +
            `path that could be extended by it will be constructed beforehand.\n`;

        neighbour.dist = neighbourNewDist;
        neighbour.heur = neighbourNewHeur;
        stage.addChange(...setPredecessor(graph, neighbour, current));
        // Add neighbour to availableNodes if it is not found, update copy of
        // data otherwise
        const indexToUpdate = availableNodes.findIndex((node) => {
          return node.desc.isEqualTo(neighbour.desc);
        });
        if (indexToUpdate != -1) {
          availableNodes[indexToUpdate] = neighbour;
          stage.description += `${neighbour.label} was already present in ` +
              `the set of nodes that can extend a path.`
        } else {
          availableNodes.push(neighbour);
          stage.description += `${neighbour.label} is added to the set of ` +
              `nodes that can extend a path.`
        }
      }
      else {
        const neighbourPredLabel =
            graph.getNodeAttribute(neighbour.desc.key, PRED_LABEL) as string;
        stage.description +=
            `This path is not shorter than the current path from ` +
            `${sourceData.label} to ${neighbour.label} ` +
            `(${neighbourNewDist} >= ${neighbour.dist}).
            When ${neighbour.label} will be choosen as current node, it will ` +
            `extend path leading through its current predecessor (${
                neighbourPredLabel}), unless shorter path that could be ` +
            `extended by it will be constructed beforehand.`;
      }
      submitStage(stage);
      stage = new ExecutionStage();
      stage.addChange(GraphChange.markElement(graph, neighbour.desc, 'reject'));
      stage.addChange(GraphChange.markElement(graph, edge.desc, 'reject'));
    });
    stage.addChange(GraphChange.markElement(graph, current.desc, 'reject'));
  }
  // Checking for graph being connected should make it impossible to pass graph
  // with no solution, but just in case
  stage = new ExecutionStage();
  stage.description =
      `Set of available nodes is empty, but the path from source to ` +
      `destination was not found.
      This should not be possible on a connected graph, with finite number of ` +
      `nodes and non-negative edge costs.
      There is an error either in correctness checks of the algorithm or the ` +
      `implementation itself.`
  submitStage(stage);
}

function setPredecessor(
    graph: UndirectedGraph, node: NodeData,
    newPredecessor: NodeData): GraphChange[] {
  const changes: GraphChange[] = [];
  changes.push(GraphChange.setProperty(graph, node.desc, DIST, node.dist));
  changes.push(GraphChange.setProperty(graph, node.desc, HEUR, node.heur));
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

/**
 * Implementation of A* algorithm that calculates heuristic by choosing path
 * with the least amount of edges between given node and the destination, and
 * assuming that all of them have the same cost, as the edge with the lowest
 * cost in the graph.
 */
export namespace leastEdgesAllHaveMinCost {
  export const strings = {
    description: `Widely used algorithm for finding the shortest path ` +
        `between nodes in a graph.
        It works by extending paths starting in source node with nodes ` +
        `neighboring them, until destination node is found. Decision, which ` +
        `path should be extended and which node should be used for that, is ` +
        `based on value of heuristic function (approximation of the distance ` +
        `to the destination). For each of the nodes that can be used for ` +
        `extension of a path, length of the path that is closest to it, length ` +
        `of the edge connecting it with the end of that path and value of ` +
        `heuristic function are added together, node which has the lowest value ` +
        `of this sum is choosen.
        Performance of the algorithm is heavily impacted by the accuracy of the ` +
        `used heuristic. Its one major drawback is the fact that all encountered ` +
        `nodes are stored in memory and there are algorithms that outperform it ` +
        `because of that, but it is still the best solution in many cases.

        Each node is described by a set of attributes:
        ${DIST} - length of the shortest path from the starting node to the node,
        ${HEUR} - approximation of the length of the shortest path from the ` +
        `starting node to the destination node, leading through the node,
        ${PRED_LABEL} - node that precedes the node on the path;

        Each edge is described by a "${COST}" attribute which denotes the ` +
        `length of the edge.

        Heuristic function used in this algorithm finds the minimum number of ` +
        `edges that needs to be traversed to move from the node to the ` +
        `destination and multiplies it by the "${COST}" of the shortest ` +
        `edge in the graph. Because of that, algorithm will be most effective ` +
        `on graphs with edges of similar length, on the other hand, graphs with ` +
        `both paths consisting of many short edges and those with fewer long ` +
        `edges will cause it to waste time extending paths with fewer edges.

        "${firstCharCap(COST)}" of each edge is required to be positive`,
    nodesAttributes: {
      distance: DIST,
      heuristic: HEUR,
      predecessorLabel: PRED_LABEL,
      predecessorKey: PRED_KEY,
    },
    edgesAttributes: {
      cost: COST,
    },
  };

  const EDGES = 'edges_from_destination';
  const MIN_COST = 'minimum_cost';

  export function aStar(
      graph: UndirectedGraph, source: string, destination: string,
      submitStage: (stage: ExecutionStage) => void) {
    // Prepare values needed for used heuristic
    graph.setAttribute(MIN_COST, getGraphMinEdgeCost(graph));
    const edgesCounts = singleSourceLength(graph, destination);
    Object.entries(edgesCounts).forEach(([node, edgesToDest]) => {
      graph.setNodeAttribute(node, EDGES, edgesToDest);
    });
    // Call algorithm
    generalAStar(graph, source, destination, submitStage, heuristic);
  }

  function heuristic(graph: UndirectedGraph, node: string): number {
    const nodesFromDest = graph.getNodeAttribute(node, EDGES);
    const minEdgeCost = graph.getAttribute(MIN_COST);
    return nodesFromDest * minEdgeCost;
  }
}

function getGraphMinEdgeCost(graph: UndirectedGraph): number {
  let minCost = Infinity;
  graph.forEachEdge((edge) => {
    const cost = graph.getEdgeAttribute(edge, COST);
    if (cost < minCost) minCost = cost;
  });
  return minCost;
}
