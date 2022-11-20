import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import {GraphStorageService} from '../../../services/graph-storage.service';
import {GraphAlgorithms} from '../../../types';

@Component({
  selector: 'app-algorithm-choice',
  templateUrl: './algorithm-choice.component.html',
  styleUrls: ['./algorithm-choice.component.css']
})
export class AlgorithmChoiceComponent implements AfterViewInit {
  @ViewChild('selection') algorithms!: ElementRef;
  @ViewChild('execution') algorithmExecution!: ElementRef;
  IMPROPER_ALGORITHM: string = 'none';
  choosenAlgorithm: string = this.IMPROPER_ALGORITHM;

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterViewInit(): void {
    const algorithmsList = this.algorithms.nativeElement as HTMLSelectElement;
    for (const value of Object.values(GraphAlgorithms)) {
      const option = document.createElement('option');
      option.innerText = value;
      algorithmsList.appendChild(option);
    }
  }

  handleChoice() {
    const select = this.algorithms.nativeElement as HTMLSelectElement;
    const selected = select.options.item(select.selectedIndex)!.value;
    if (selected != this.choosenAlgorithm) {
      this.choosenAlgorithm = selected;
      this.graphStorage.adjustGraphFields(this.choosenAlgorithm);
      (this.algorithmExecution!.nativeElement as HTMLButtonElement).disabled =
          false;
    }
  }

  executeAlgorithm() {}
}
