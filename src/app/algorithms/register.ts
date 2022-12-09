import {GraphChecks} from '../utility/graphFunctions';
import {AttributeDescriptor, GraphCheck, mainThreadAlgorithmCall} from '../utility/types';

import {dijkstra} from './dijkstra/dijkstra-algorithm';

export const graphAlgorithms: {
  [key: string]: {
    nodeProperties: AttributeDescriptor[],
    edgeProperties: AttributeDescriptor[],
    getWorker: () => Worker,
    mainThreadFunction: mainThreadAlgorithmCall,
    correctnessChecks: GraphCheck[],
    nodesLabel?: string,
    edgesLabel?: string,
  }
} = {
  'Dijkstra': {
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
    nodesLabel: 'distance',
    getWorker: () => {return new Worker(
        new URL('dijkstra/dijkstra.worker', import.meta.url))},
    mainThreadFunction: dijkstra,
    correctnessChecks: [
      GraphChecks.staticChecks.isConnected,
      (graph) => {
        return GraphChecks.dynamicChecks.areAttributesInRange(
            graph, 'edge', 'cost', {min: 0});
      },
    ],
  },
  'A*': {
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
