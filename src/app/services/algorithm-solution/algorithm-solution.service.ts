import {Injectable} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {GraphStorageService} from '../graph-storage/graph-storage.service';

@Injectable({providedIn: 'root'})
export class AlgorithmSolutionService {
  executionStack: ExecutionStage[] = [];
  currentIndex: number = 0;

  constructor(private graphStorage: GraphStorageService) {}

  step(step: number) {
    let newIndex = this.currentIndex + step;
    if (newIndex < 0)
      newIndex = 0;
    else if (newIndex > this.executionStack.length)
      newIndex =
          this.executionStack.length > 0 ? this.executionStack.length : 0;
    if (newIndex == this.currentIndex) return;

    let begin = newIndex;
    let end = this.currentIndex;
    if (newIndex > this.currentIndex) {
      begin = this.currentIndex;
      end = newIndex;
    }
    let changes = this.executionStack.slice(begin, end);
    if (newIndex > this.currentIndex) {
      changes.forEach((stage) => {
        stage.apply(this.graphStorage.graph);
      });
    } else {
      changes.reverse();
      changes.forEach((stage) => {
        stage.reverse(this.graphStorage.graph);
      });
    }
    this.graphStorage.triggerGraphicRefresh();
    this.currentIndex = newIndex;
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
