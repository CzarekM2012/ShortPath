import {Component, ElementRef, ViewChild} from '@angular/core';

import {AlgorithmSolutionService} from '../../services/algorithm-solution/algorithm-solution.service';
import {EnforceNumberInput} from '../../utility/functions';
import {algorithmCallType} from '../../utility/types';

@Component({
  selector: 'app-algorithm-controller',
  templateUrl: './algorithm-controller.component.html',
  styleUrls: ['./algorithm-controller.component.css']
})
export class AlgorithmControllerComponent {
  @ViewChild('execution') algorithmExecution!: ElementRef;
  @ViewChild('return') resetGraph!: ElementRef;
  @ViewChild('mainThreadExecution') algorithmMainThreadExecution!: ElementRef;
  @ViewChild('stepsCount') stepsInput!: ElementRef;
  @ViewChild('stepBackward') backwardButton!: ElementRef;
  @ViewChild('stepForward') forwardButton!: ElementRef;

  constructor(private algorithmSolution: AlgorithmSolutionService) {}

  handleStepsNumber() {
    EnforceNumberInput.enforceRange(this.stepsInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.stepsInput.nativeElement);
  }

  changeExecutionStep(direction: 'backward'|'forward') {
    const stepsInput = (this.stepsInput.nativeElement as HTMLInputElement);
    let steps = Number(stepsInput.value);
    if (direction == 'backward') steps = -steps;
    this.algorithmSolution.step(steps);
  }

  executeAlgorithm(mode: algorithmCallType) {
    if (this.algorithmSolution.executeAlgorithm(mode)) {
      (this.algorithmExecution.nativeElement as HTMLButtonElement).hidden =
          true;
      (this.resetGraph.nativeElement as HTMLButtonElement).hidden = false;
      (this.backwardButton.nativeElement as HTMLButtonElement).disabled = false;
      (this.forwardButton.nativeElement as HTMLButtonElement).disabled = false;
    }
  }

  endInspection() {
    this.algorithmSolution.step(-Infinity);
    (this.algorithmExecution.nativeElement as HTMLButtonElement).hidden = false;
    (this.resetGraph.nativeElement as HTMLButtonElement).hidden = true;
    (this.backwardButton.nativeElement as HTMLButtonElement).disabled = true;
    (this.forwardButton.nativeElement as HTMLButtonElement).disabled = true;
  }
}
