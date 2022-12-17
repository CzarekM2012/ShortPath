import {AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {graphAlgorithms} from '../../algorithms/register';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';

@Component({
  selector: 'app-algorithm-choice',
  templateUrl: './algorithm-choice.component.html',
  styleUrls: ['./algorithm-choice.component.css']
})
export class AlgorithmChoiceComponent implements AfterViewInit,
                                                 AfterContentInit {
  @ViewChild('description') descriptionArea!: ElementRef<HTMLElement>;
  algorithms: string[] = Object.keys(graphAlgorithms);
  algorithmChoice: FormControl = new FormControl<string|null>(null);

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterContentInit(): void {
    if (this.graphStorage.choosenAlgorithm in graphAlgorithms) {
      this.algorithmChoice.setValue(this.graphStorage.choosenAlgorithm);
    }
  }

  ngAfterViewInit(): void {
    this.algorithmChoice.valueChanges.subscribe(() => {
      this.updateDescription();
    });
    // AfterViewInit happens after AfterContentInit and subscription cannot
    // handle possible value change from AfterContentInit
    this.updateDescription();
  }

  updateDescription() {
    const value = this.algorithmChoice.value as string | null;
    if (value === null) return;
    this.descriptionArea.nativeElement.innerText =
        graphAlgorithms[value].description;
  }

  // Element this function is linked to is disabled when
  // this.algorithmChoice.value === null
  beforeVisualisation() {
    const value = this.algorithmChoice.value as string;
    this.graphStorage.changeAlgorithm(value);
  }
}
