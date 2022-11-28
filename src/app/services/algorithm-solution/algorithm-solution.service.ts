import {Injectable} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {GraphStorageService} from '../graph-storage/graph-storage.service';

@Injectable({providedIn: 'root'})
export class AlgorithmSolutionService {
  executionStack: any[] = [];
  currentIndex: number = 0;

  constructor(private graphStorage: GraphStorageService) {}

  step(step: number) {
    this.currentIndex += step;
    if (this.currentIndex < 0)
      this.currentIndex = 0;
    else if (this.currentIndex >= this.executionStack.length)
      this.currentIndex =
          this.executionStack.length > 0 ? this.executionStack.length - 1 : 0;
  }

  executeAlgorithm(algorithm: string) {
    if (algorithm in graphAlgorithms) {
      if (typeof Worker !== 'undefined') {
        this.executionStack = [];
        const worker = new Worker(
            new URL(graphAlgorithms[algorithm].workerPath, import.meta.url));
        worker.onmessage = ({data}) => {
          console.log(data);
          this.executionStack.push(data);
        };
        worker.postMessage({
          graph: this.graphStorage.graph,
          source: this.graphStorage.graph.nodes()[0],
          destination: this.graphStorage.graph.nodes()[-1]
        });
      } else {
        alert(
            'Your browser does not support webworkers, making it impossible to ' +
            'execute algorithm in the background.\nAlgorithm will be executed ' +
            'in main thread, GUI may stop responding, depending on complexity ' +
            'of the task');
        graphAlgorithms[algorithm].mainThreadFunction();
      }
    } else
      console.error('Attempted to execute unsupported algorithm.');
  }
}
