import {Injectable} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {GraphStorageService} from '../graph-storage/graph-storage.service';

@Injectable({providedIn: 'root'})
export class AlgorithmSolutionService {
  executionStack: ExecutionStage[] = [];
  currentIndex: number = 0;
  errorMarkings: GraphChange[] = [];

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
    this.graphStorage.triggerGraphicRefresh(
        newIndex >= 1 ?
            this.executionStack[newIndex - 1].description :
            'You came back to before the first stage of algorithm execution');
    this.currentIndex = newIndex;
  }

  executeAlgorithm(algorithm: string) {
    this.errorMarkings.forEach((change) => {
      change.reverse(this.graphStorage.graph);
    });
    this.errorMarkings = [];
    if (algorithm in graphAlgorithms) {
      for (const condition of graphAlgorithms[algorithm].correctnessChecks) {
        const {message, markings} = condition(this.graphStorage.graph);
        if (markings.length > 0) {
          alert(message);
          this.errorMarkings = markings;
          return;
        };
      }
      if (typeof Worker !== 'undefined') {
        this.workerAlgorithmCall(algorithm);
      } else {
        this.mainThreadAlgorithmCall(algorithm);
      }
    } else
      console.error('Attempted to execute unsupported algorithm.');
  }

  workerAlgorithmCall(algorithm: string) {
    if (!this._checkEnds()) return;
    this.executionStack = [];
    const worker = graphAlgorithms[algorithm].getWorker();
    //  Values of properties are preserved, but methods are lost due to
    //  algorithm used to copy data passed through messages
    worker.onmessage = ({data}: {data: ExecutionStage}) => {
      const restoredStage = new ExecutionStage();
      restoredStage.description = data.description
      restoredStage.changes = data.changes.map((degeneratedChange) => {
        return new GraphChange(
            degeneratedChange.element, degeneratedChange.property,
            degeneratedChange.formerValue, degeneratedChange.newValue);
      });
      this.executionStack.push(restoredStage);
    };
    worker.postMessage({
      graphData: this.graphStorage.graph.export(),
      source: this.graphStorage.startNode,
      destination: this.graphStorage.endNode,
    });
  }

  mainThreadAlgorithmCall(algorithm: string) {
    if (!this._checkEnds()) return;
    this.executionStack = [];
    alert(
        'Your browser does not support webworkers, making it impossible to ' +
        'execute algorithm in the background.\nAlgorithm will be executed ' +
        'in main thread, GUI may stop responding, depending on complexity ' +
        'of the task');
    graphAlgorithms[algorithm].mainThreadFunction(
        this.executionStack,
        this.graphStorage.graph,
        this.graphStorage.startNode as string,
        this.graphStorage.endNode as string,
    );
    this.currentIndex = this.executionStack.length;
    this.step(-Infinity);
  }

  _checkEnds() {
    if (this.graphStorage.startNode === undefined ||
        this.graphStorage.endNode === undefined) {
      alert(
          'Both start and end node need to be choosen before executing algorithm');
      return false;
    }
    return true;
  }
}
