import {GraphChecks} from '../utility/graphFunctions';
import {AlgorithmDefinition} from '../utility/types';

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
  'A*': {
    description: 'description of A* algorithm',
    nodeProperties: [
      {name: 'distance', defaultValue: 10, visible: true, userModifiable: false}
    ],
    edgeProperties: [],
    getWorker: () => {
      return new Worker('');
    },
    mainThreadFunction: () => {alert('A* is unsupported as of yet')},
    correctnessChecks: [],
  },
  'Bellman-Ford': {
    description: 'description of Bellman-Ford algorithm',
    nodeProperties: [
      {name: 'distance', defaultValue: 0, visible: true, userModifiable: false}
    ],
    edgeProperties: [],
    getWorker: () => {
      return new Worker('');
    },
    mainThreadFunction: () => {alert('Bellman-Ford is unsupported as of yet')},
    correctnessChecks: [],
  },
}
