import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

import {AlgorithmSolutionService} from '../../services/algorithm-solution/algorithm-solution.service';
import {EnforceNumberInput} from '../../utility/functions';
import {algorithmCallType} from '../../utility/types';

@Component({
  selector: 'app-algorithm-controller',
  templateUrl: './algorithm-controller.component.html',
  styleUrls: ['./algorithm-controller.component.css']
})
export class AlgorithmControllerComponent {
  @ViewChild('stepsCount') private stepsInput!: ElementRef<HTMLInputElement>;
  @Output() private executingChange = new EventEmitter<boolean>();
  @Input() executing!: boolean;
  @Input() production!: boolean;

  constructor(private algorithmSolution: AlgorithmSolutionService) {}

  protected handleStepsNumber() {
    EnforceNumberInput.enforceRange(this.stepsInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.stepsInput.nativeElement);
  }

  protected changeExecutionStep(direction: 'backward'|'forward') {
    let steps = Number(this.stepsInput.nativeElement.value);
    if (direction == 'backward') steps = -steps;
    this.algorithmSolution.step(steps);
  }

  protected executeAlgorithm(mode: algorithmCallType) {
    this.executingChange.emit(this.algorithmSolution.executeAlgorithm(mode));
  }

  protected endInspection() {
    this.algorithmSolution.step(-Infinity);
    this.executingChange.emit(false);
  }
}
