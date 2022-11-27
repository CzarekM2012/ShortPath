import {propertyDescriptor} from '../utility/types';

export const GraphAlgorithms: {
  [key: string]: {
    nodeProperties: propertyDescriptor[],
    edgeProperties: propertyDescriptor[],
    workerPath: string,
    mainThreadFunction: () => void
  }
} = {
  'Dijkstra': {
    nodeProperties: [
      {name: 'cost', type: 'number', default: 1},
    ],
    edgeProperties: [
      {name: 'distance', type: 'number', default: Infinity},
    ],
    workerPath: '',
    mainThreadFunction: () => {alert('Dijkstra is unsupported as of yet')},
  },
  'A*': {
    nodeProperties: [],
    edgeProperties: [],
    workerPath: '',
    mainThreadFunction: () => {alert('A* is unsupported as of yet')},
  },
  'Bellman-Ford': {
    nodeProperties: [],
    edgeProperties: [],
    workerPath: '',
    mainThreadFunction: () => {alert('Bellman-Ford is unsupported as of yet')},
  },
}
