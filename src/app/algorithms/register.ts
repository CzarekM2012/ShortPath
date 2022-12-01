import Graph from 'graphology';

import {ExecutionStage} from '../utility/execution-stage/execution-stage';
import {AttributeDescriptor} from '../utility/types';

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
    getWorker: () => {
      return new Worker('');
    },
    mainThreadFunction: () => {alert('Dijkstra is unsupported as of yet')},
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
