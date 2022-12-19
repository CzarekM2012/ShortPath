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
  @ViewChild('execution') private algorithmExecution!: ElementRef;
  @ViewChild('return') private resetGraph!: ElementRef;
  @ViewChild('stepsCount') private stepsInput!: ElementRef;
  @ViewChild('stepBackward') private backwardButton!: ElementRef;
  @ViewChild('stepForward') private forwardButton!: ElementRef;

  constructor(private algorithmSolution: AlgorithmSolutionService) {}

  protected handleStepsNumber() {
    EnforceNumberInput.enforceRange(this.stepsInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.stepsInput.nativeElement);
  }

  protected changeExecutionStep(direction: 'backward'|'forward') {
    const stepsInput = (this.stepsInput.nativeElement as HTMLInputElement);
    let steps = Number(stepsInput.value);
    if (direction == 'backward') steps = -steps;
    this.algorithmSolution.step(steps);
  }

  protected executeAlgorithm(mode: algorithmCallType) {
    if (this.algorithmSolution.executeAlgorithm(mode)) {
      (this.algorithmExecution.nativeElement as HTMLButtonElement).hidden =
          true;
      (this.resetGraph.nativeElement as HTMLButtonElement).hidden = false;
      (this.backwardButton.nativeElement as HTMLButtonElement).disabled = false;
      (this.forwardButton.nativeElement as HTMLButtonElement).disabled = false;
    }
  }

  protected endInspection() {
    this.algorithmSolution.step(-Infinity);
    (this.algorithmExecution.nativeElement as HTMLButtonElement).hidden = false;
    (this.resetGraph.nativeElement as HTMLButtonElement).hidden = true;
    (this.backwardButton.nativeElement as HTMLButtonElement).disabled = true;
    (this.forwardButton.nativeElement as HTMLButtonElement).disabled = true;
  }
}
