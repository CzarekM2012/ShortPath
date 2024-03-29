import {Injectable} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {ExecutionStage} from '../../utility/execution-stage/execution-stage';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {algorithmCallType, ElementDescriptor} from '../../utility/types';
import {ChangeEmitterService} from '../change-emitter/change-emitter.service';
import {GraphStorageService} from '../graph-storage/graph-storage.service';

@Injectable({providedIn: 'root'})
export class AlgorithmSolutionService {
  private executionStack: ExecutionStage[] = [];
  private currentIndex: number = 0;
  private errorMarkings: GraphChange[] = [];

  constructor(
      private graphStorage: GraphStorageService,
      private changeEmitter: ChangeEmitterService) {}

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

    let attributesChangesNotifications:
        {element: ElementDescriptor, attribute: string}[] = [];
    if (newIndex > this.currentIndex) {
      changes.forEach((stage) => {
        const notifications = stage.apply(this.graphStorage.graph);
        attributesChangesNotifications.push(...notifications);
      });
    } else {
      changes.reverse();
      changes.forEach((stage) => {
        const notifications = stage.reverse(this.graphStorage.graph);
        attributesChangesNotifications.push(...notifications);
      });
    }

    attributesChangesNotifications.forEach((notification) => {
      this.changeEmitter.graphElementAttributeChange.next(
          {...notification, origin: 'algorithm'});
    });
    this.changeEmitter.stageDescriptionChange.next(
        newIndex >= 1 ?
            this.executionStack[newIndex - 1].description :
            'You came back to before the first stage of algorithm execution');
    this.currentIndex = newIndex;
  }

  executeAlgorithm(mode: algorithmCallType = 'normal'): boolean {
    if (this.graphStorage.getChoosenAlgorithm() in graphAlgorithms) {
      if (!this.checkConditions(this.graphStorage.getChoosenAlgorithm()) ||
          !this.checkEnds())
        return false;
      if (mode == 'mainThread' || typeof Worker === 'undefined') {
        this.mainThreadAlgorithmCall(this.graphStorage.getChoosenAlgorithm());
      } else {
        this.workerAlgorithmCall(this.graphStorage.getChoosenAlgorithm());
      }
      return true;
    } else {
      console.error('Attempted to execute unsupported algorithm.');
      return false;
    }
  }

  private checkConditions(algorithm: string): boolean {
    this.errorMarkings.forEach((change) => {
      change.reverse(this.graphStorage.graph);
    });
    this.errorMarkings = [];
    for (const condition of graphAlgorithms[algorithm].correctnessChecks) {
      const {message, markings} = condition(this.graphStorage.graph);
      if (markings.length > 0) {
        alert(message);
        this.errorMarkings = markings;
        return false;
      };
    }
    return true;
  }

  private workerAlgorithmCall(algorithm: string) {
    this.executionStack = [];
    const worker = graphAlgorithms[algorithm].getWorker();
    //  Values of properties are preserved, but methods are lost due to
    //  algorithm used to copy data passed through messages
    worker.onmessage = ({data}: {data: ExecutionStage}) => {
      const restoredStage = new ExecutionStage();
      restoredStage.description = data.description
      restoredStage.changes = data.changes.map((degeneratedChange) => {
        const restoredDescriptor = new ElementDescriptor(
            degeneratedChange.element.key, degeneratedChange.element.type);
        return new GraphChange(
            restoredDescriptor, degeneratedChange.property,
            degeneratedChange.formerValue, degeneratedChange.newValue);
      });
      this.executionStack.push(restoredStage);
    };
    worker.postMessage({
      graphData: this.graphStorage.graph.export(),
      source: this.graphStorage.pathEnds.startNode,
      destination: this.graphStorage.pathEnds.endNode,
    });
  }

  private mainThreadAlgorithmCall(algorithm: string) {
    this.executionStack = [];
    alert(
        'Your browser does not support webworkers, making it impossible to ' +
        'execute algorithm in the background.\nAlgorithm will be executed ' +
        'in main thread, GUI may stop responding, depending on complexity ' +
        'of the task');
    graphAlgorithms[algorithm].mainThreadFunction(
        this.graphStorage.graph, this.graphStorage.pathEnds.startNode!,
        this.graphStorage.pathEnds.endNode!, (stage) => {
          this.executionStack.push(stage);
        });
    this.currentIndex = this.executionStack.length;
    this.step(-Infinity);
  }

  private checkEnds() {
    if (this.graphStorage.pathEnds.startNode === undefined ||
        this.graphStorage.pathEnds.endNode === undefined) {
      alert(
          'Both start and end node need to be choosen before executing algorithm');
      return false;
    }
    return true;
  }
}
