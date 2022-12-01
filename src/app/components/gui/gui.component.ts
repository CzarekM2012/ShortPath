import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {AlgorithmSolutionService} from '../../services/algorithm-solution/algorithm-solution.service';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {EnforceNumberInput} from '../../utility/functions';
import {ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-gui',
  templateUrl: './gui.component.html',
  styleUrls: ['./gui.component.css']
})
export class GUIComponent implements OnInit, AfterViewInit {
  @ViewChild('stepsCount') stepsInput!: ElementRef;
  @ViewChild('stageDescription') stageDescription!: ElementRef;
  elementDescriptor?: ElementDescriptor;
  descriptionSubscription: any;

  constructor(
      private graphStorage: GraphStorageService,
      private algorithmSolution: AlgorithmSolutionService) {}

  ngOnInit(): void {
    this.descriptionSubscription =
        this.graphStorage.graphicRefresh.subscribe((text) => {
          (this.stageDescription.nativeElement as HTMLElement).innerText = text;
        });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.descriptionSubscription.unsubscribe();
  }

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
