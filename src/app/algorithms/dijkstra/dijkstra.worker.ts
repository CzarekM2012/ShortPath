/// <reference lib="webworker" />
import SerializedGraph, {UndirectedGraph} from 'graphology';

import {dijkstraAlgorithm} from './dijkstra-algorithm';

addEventListener('message', ({data}) => {
  const {graphData, source, destination}:
      {graphData: SerializedGraph, source: string, destination: string} = data;
  const graph = UndirectedGraph.from(graphData);
  dijkstraAlgorithm(graph, source, destination, (stage) => {
    postMessage(stage);
  });
});
