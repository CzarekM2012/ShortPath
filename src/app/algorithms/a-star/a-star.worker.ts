/// <reference lib="webworker" />
import SerializedGraph, {UndirectedGraph} from 'graphology';

import {leastEdgesAllHaveMinCost} from './a-star-algorithm';

addEventListener('message', ({data}) => {
  const {graphData, source, destination}:
      {graphData: SerializedGraph, source: string, destination: string} = data;
  const graph = UndirectedGraph.from(graphData);
  leastEdgesAllHaveMinCost.aStar(graph, source, destination, (stage) => {
    postMessage(stage);
  });
});
