import {GraphChecks} from '../utility/graphFunctions';
import {AlgorithmDefinition} from '../utility/types';

import {leastEdgesAllHaveMinCost} from './a-star/a-star-algorithm';
import {dijkstraAlgorithm, dijkstraConsts} from './dijkstra/dijkstra-algorithm';

export const graphAlgorithms: {[key: string]: AlgorithmDefinition;} = {
  'Dijkstra': {
    description: dijkstraConsts.description,
    nodeProperties: [
      {
        name: dijkstraConsts.nDistName,
        defaultValue: Infinity,
        visible: true,
        userModifiable: false
      },
    ],
    edgeProperties: [
      {
        name: dijkstraConsts.eCostName,
        defaultValue: 1,
        visible: true,
        userModifiable: true,
      },
    ],
    edgesLabel: dijkstraConsts.eCostName,
    getWorker: () => {
      return new Worker(new URL('dijkstra/dijkstra.worker', import.meta.url));
    },
    mainThreadFunction: dijkstraAlgorithm,
    correctnessChecks: [
      GraphChecks.staticChecks.isConnected,
      (graph) => {
        return GraphChecks.dynamicChecks.areAttributesInRange(
            graph, 'edge', dijkstraConsts.eCostName, {min: 0});
      },
    ],
  },
  'A* (minimal number of edges heuristic)': {
    description: leastEdgesAllHaveMinCost.strings.description,
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
