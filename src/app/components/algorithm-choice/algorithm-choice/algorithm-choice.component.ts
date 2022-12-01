import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import {graphAlgorithms} from '../../../algorithms/register';
import {AlgorithmSolutionService} from '../../../services/algorithm-solution/algorithm-solution.service';
import {GraphStorageService} from '../../../services/graph-storage/graph-storage.service';

@Component({
  selector: 'app-algorithm-choice',
  templateUrl: './algorithm-choice.component.html',
  styleUrls: ['./algorithm-choice.component.css']
})
export class AlgorithmChoiceComponent implements AfterViewInit {
  @ViewChild('selection') algorithms!: ElementRef;
  @ViewChild('execution') algorithmExecution!: ElementRef;
  @ViewChild('mainThreadExecution') algorithmMainThreadExecution!: ElementRef;
  IMPROPER_ALGORITHM: string = 'none';
  choosenAlgorithm: string = this.IMPROPER_ALGORITHM;

  constructor(
      private graphStorage: GraphStorageService,
      private algorithmSolution: AlgorithmSolutionService) {}

  ngAfterViewInit(): void {
    const algorithmsList = this.algorithms.nativeElement as HTMLSelectElement;
    for (const key of Object.keys(graphAlgorithms)) {
      const option = document.createElement('option');
      option.innerText = key;
      algorithmsList.appendChild(option);
    }
  }

  handleChoice() {
    const select = this.algorithms.nativeElement as HTMLSelectElement;
    const selected = select.options.item(select.selectedIndex)!.value;
    if (selected != this.choosenAlgorithm) {
      this.choosenAlgorithm = selected;
      this.graphStorage.changeAlgorithm(this.choosenAlgorithm);
      (this.algorithmExecution.nativeElement as HTMLButtonElement).disabled =
          false;
      (this.algorithmMainThreadExecution.nativeElement as HTMLButtonElement)
          .disabled = false;
    }
  }

  executeAlgorithm(mode: 'normal'|'mainThread' = 'normal') {
    if (this.choosenAlgorithm != this.IMPROPER_ALGORITHM) {
      if (mode == 'normal') {
        this.algorithmSolution.executeAlgorithm(this.choosenAlgorithm);
        return;
      }
      this.algorithmSolution.mainThreadAlgorithmCall(this.choosenAlgorithm);
    }
  }
}