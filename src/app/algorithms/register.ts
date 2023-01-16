import {GraphChecks} from '../utility/graphFunctions';
import {AlgorithmDefinition} from '../utility/types';

import {leastEdgesAllHaveMinCost} from './a-star/a-star-algorithm';
import {dijkstraAlgorithm, dijkstraStrings} from './dijkstra/dijkstra-algorithm';

export const graphAlgorithms: {[key: string]: AlgorithmDefinition;} = {
  'Dijkstra': {
    descriptions: dijkstraStrings.descriptions,
    nodeProperties: [
      {
        name: dijkstraStrings.nodesAttributes.distance,
        defaultValue: Infinity,
        visible: true,
        userModifiable: false
      },
      {
        name: dijkstraStrings.nodesAttributes.predecessorLabel,
        defaultValue: '?',
        visible: true,
        userModifiable: false
      },
      {
        name: dijkstraStrings.nodesAttributes.predecessorKey,
        defaultValue: '?',
        visible: false,
        userModifiable: false
      },
    ],
    edgeProperties: [
      {
        name: dijkstraStrings.edgesAttributes.cost,
        defaultValue: 1,
        visible: true,
        userModifiable: true,
      },
    ],
    edgesLabel: dijkstraStrings.edgesAttributes.cost,
    getWorker: () => {
      return new Worker(new URL('dijkstra/dijkstra.worker', import.meta.url));
    },
    mainThreadFunction: dijkstraAlgorithm,
    correctnessChecks: [
      GraphChecks.staticChecks.isConnected,
      (graph) => {
        return GraphChecks.dynamicChecks.areAttributesInRange(
            graph, 'edge', dijkstraStrings.edgesAttributes.cost, {min: 0});
      },
    ],
  },
  'A* (minimal number of edges heuristic)': {
    descriptions: leastEdgesAllHaveMinCost.strings.descriptions,
    nodeProperties: [
      {
        name: leastEdgesAllHaveMinCost.strings.nodesAttributes.distance,
        defaultValue: Infinity,
        visible: true,
        userModifiable: false,
      },
      {
        name: leastEdgesAllHaveMinCost.strings.nodesAttributes.heuristic,
        defaultValue: Infinity,
        visible: true,
        userModifiable: false,
      },
      {
        name: leastEdgesAllHaveMinCost.strings.nodesAttributes.predecessorKey,
        defaultValue: '?',
        visible: false,
        userModifiable: false,
      },
      {
        name: leastEdgesAllHaveMinCost.strings.nodesAttributes.predecessorLabel,
        defaultValue: '?',
        visible: true,
        userModifiable: false,
      },
    ],
    edgeProperties: [
      {
        name: leastEdgesAllHaveMinCost.strings.edgesAttributes.cost,
        defaultValue: 1,
        visible: true,
        userModifiable: true,
      },
    ],
    getWorker: () => {
      return new Worker(new URL('a-star/a-star.worker', import.meta.url));
    },
    mainThreadFunction: leastEdgesAllHaveMinCost.aStar,
    correctnessChecks: [],
  },
}
