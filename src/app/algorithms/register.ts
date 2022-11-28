import {AttributeDescriptor} from '../utility/types';

export const graphAlgorithms: {
  [key: string]: {
    nodeProperties: AttributeDescriptor[],
    edgeProperties: AttributeDescriptor[],
    workerPath: string,
    mainThreadFunction: () => void
  }
} = {
  'Dijkstra': {
    nodeProperties: [
      {name: 'cost', default: 1},
    ],
    edgeProperties: [
      {name: 'distance', default: Infinity},
    ],
    workerPath: '',
    mainThreadFunction: () => {alert('Dijkstra is unsupported as of yet')},
  },
  'A*': {
    nodeProperties: [{name: 'cost', default: 10}],
    edgeProperties: [],
    workerPath: '',
    mainThreadFunction: () => {alert('A* is unsupported as of yet')},
  },
  'Bellman-Ford': {
    nodeProperties: [{name: 'cost', default: 'zzzzzzzzzzzzzzzzzzz'}],
    edgeProperties: [],
    workerPath: '',
    mainThreadFunction: () => {alert('Bellman-Ford is unsupported as of yet')},
  },
}
