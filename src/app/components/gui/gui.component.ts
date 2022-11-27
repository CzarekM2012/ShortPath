import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import {AlgorithmSolutionService} from '../../services/algorithm-solution/algorithm-solution.service';
import {EnforceNumberInput} from '../../utility/functions';
import {ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-gui',
  templateUrl: './gui.component.html',
  styleUrls: ['./gui.component.css']
})
export class GUIComponent implements AfterViewInit {
  @ViewChild('stepsCount') stepsInput!: ElementRef;
  elementDescriptor?: ElementDescriptor;

  constructor(private algorithmSolution: AlgorithmSolutionService) {}

  ngAfterViewInit(): void {}

  elementChoice(event: ElementDescriptor) {
    this.elementDescriptor = event;
  }

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
}
