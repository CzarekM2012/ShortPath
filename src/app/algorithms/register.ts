import {GraphChecks} from '../utility/graphFunctions';
import {AttributeDescriptor, GraphCheck, mainThreadAlgorithmCall} from '../utility/types';

import {dijkstraAlgorithm} from './dijkstra/dijkstra-algorithm';

export const graphAlgorithms: {
  [key: string]: {
    description: string,
    nodeProperties: AttributeDescriptor[],
    edgeProperties: AttributeDescriptor[],
    getWorker: () => Worker,
    mainThreadFunction: mainThreadAlgorithmCall,
    correctnessChecks: GraphCheck[],
    edgesLabel?: string,
  }
} = {
  'Dijkstra': {
    description: 'description of Dijkstra algorithm',
    nodeProperties: [
      {
        name: 'distance',
        defaultValue: Infinity,
        visible: true,
        userModifiable: false,
      },
    ],
    edgeProperties: [
      {name: 'cost', defaultValue: 1, visible: true, userModifiable: true},
    ],
    edgesLabel: 'cost',
    getWorker: () => {return new Worker(
        new URL('dijkstra/dijkstra.worker', import.meta.url))},
    mainThreadFunction: dijkstraAlgorithm,
    correctnessChecks: [
      GraphChecks.staticChecks.isConnected,
      (graph) => {
        return GraphChecks.dynamicChecks.areAttributesInRange(
            graph, 'edge', 'cost', {min: 0});
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
