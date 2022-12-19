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
  @ViewChild('description') private descriptionArea!: ElementRef<HTMLElement>;
  protected algorithms: string[] = Object.keys(graphAlgorithms);
  protected algorithmChoice: FormControl = new FormControl<string|null>(null);

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterContentInit(): void {
    if (this.graphStorage.getChoosenAlgorithm() in graphAlgorithms) {
      this.algorithmChoice.setValue(this.graphStorage.getChoosenAlgorithm());
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

  private updateDescription() {
    const value = this.algorithmChoice.value as string | null;
    if (value === null) return;
    this.descriptionArea.nativeElement.innerText =
        graphAlgorithms[value].description;
  }

  // Element this function is linked to is disabled when
  // this.algorithmChoice.value === null
  protected beforeVisualisation() {
    const value = this.algorithmChoice.value as string;
    this.graphStorage.changeAlgorithm(value);
  }
}
