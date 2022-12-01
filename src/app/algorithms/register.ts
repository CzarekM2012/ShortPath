import Graph from 'graphology';

import {ExecutionStage} from '../utility/execution-stage/execution-stage';
import {AttributeDescriptor} from '../utility/types';

import {dijkstra} from './dijkstra/dijkstra-algorithm';

export const graphAlgorithms: {
  [key: string]: {
    nodeProperties: AttributeDescriptor[],
    edgeProperties: AttributeDescriptor[],
    getWorker: () => Worker,
    mainThreadFunction:
        (executionStack: ExecutionStage[], graph: Graph, source: string,
         destination: string) => void
  }
} = {
  'Dijkstra': {
    nodeProperties: [
      {name: 'distance', default: Infinity},
    ],
    edgeProperties: [
      {name: 'cost', default: 1},
    ],
    getWorker: () => {return new Worker(
        new URL('dijkstra/dijkstra.worker', import.meta.url))},
    mainThreadFunction: dijkstra,
  },
  'A*': {
    nodeProperties: [{name: 'distance', default: 10}],
    edgeProperties: [],
    getWorker: () => {
      return new Worker('');
    },
    mainThreadFunction: () => {alert('A* is unsupported as of yet')},
  },
  'Bellman-Ford': {
    nodeProperties: [{name: 'distance', default: 'zzzzzzzzzzzzzzzzzzz'}],
    edgeProperties: [],
    getWorker: () => {
      return new Worker('');
    },
    mainThreadFunction: () => {alert('Bellman-Ford is unsupported as of yet')},
  },
}
