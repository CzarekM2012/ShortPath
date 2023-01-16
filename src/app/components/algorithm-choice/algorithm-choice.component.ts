import {AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

import {graphAlgorithms} from '../../algorithms/register';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {firstCharCap} from '../../utility/graphFunctions';
import {AlgorithmDescriptionDisplayMode, ElementType, GraphElementsAttributesDescriptions} from '../../utility/types';

@Component({
  selector: 'app-algorithm-choice',
  templateUrl: './algorithm-choice.component.html',
  styleUrls: ['./algorithm-choice.component.css']
})
export class AlgorithmChoiceComponent implements AfterViewInit,
                                                 AfterContentInit {
  @ViewChild('description')
  private descriptionDisplay!: ElementRef<HTMLElement>;
  @ViewChild('origin') private originDisplay!: ElementRef<HTMLElement>;
  @ViewChild('pseudocode') private pseudocodeDisplay!: ElementRef<HTMLElement>;
  @ViewChild('definitions')
  private definitionsDisplay!: ElementRef<HTMLElement>;
  @ViewChild('references') private referencesDisplay!: ElementRef<HTMLElement>;
  protected algorithms: string[] = Object.keys(graphAlgorithms);
  protected algorithmChoice: FormControl = new FormControl<string|null>(null);
  protected viewing: AlgorithmDescriptionDisplayMode = 'description';

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterContentInit(): void {
    if (this.graphStorage.getChoosenAlgorithm() in graphAlgorithms) {
      this.algorithmChoice.setValue(this.graphStorage.getChoosenAlgorithm());
    }
  }

  ngAfterViewInit(): void {
    this.algorithmChoice.valueChanges.subscribe(() => {
      this.updateDescriptions();
    });
    // AfterViewInit happens after AfterContentInit and subscription cannot
    // handle possible value change from AfterContentInit
    // Subscription cannot be added in AfterContentInit since triggered function
    // operates on ElementRef which has proper value after AfterContentInit
    this.updateDescriptions();
  }

  private updateDescriptions() {
    const value = this.algorithmChoice.value as string | null;
    if (value === null) return;
    const descriptions = graphAlgorithms[value].descriptions;
    if (descriptions === undefined) return;
    this.descriptionDisplay.nativeElement.innerText = descriptions.general;
    this.originDisplay.nativeElement.innerText = descriptions.history;
    this.pseudocodeDisplay.nativeElement.innerText = descriptions.pseudocode;
    this.definitionsDisplay.nativeElement.innerText =
        this.getAttributesDefinitionsString(descriptions.attributesDefinitions);
    'Choosen algorithm does not define any attributes for nodes or edges';
    this.referencesDisplay.nativeElement.innerText = descriptions.references;
  }

  // Element this function is linked to is disabled when
  // this.algorithmChoice.value === null
  protected beforeVisualisation() {
    const value = this.algorithmChoice.value as string;
    this.graphStorage.changeAlgorithm(value);
  }

  private getAttributesDefinitionsString(
      definitions: GraphElementsAttributesDescriptions|undefined): string {
    if (definitions === undefined ||
        (Object.keys(definitions.nodes).length == 0) &&
            Object.keys(definitions.edges).length == 0) {
      return 'Choosen algorithm does not define any attributes for nodes or edges';
    }

    const nodesDefinitions = this.getElementTypeAttributesDefinitionsString(
        definitions.nodes, 'node');

    const edgesDefinitions = this.getElementTypeAttributesDefinitionsString(
        definitions.edges, 'edge');

    return nodesDefinitions + '\n\n' + edgesDefinitions;
  }

  private getElementTypeAttributesDefinitionsString(
      definitions: {[key: string]: string}, type: ElementType): string {
    if (Object.keys(definitions).length == 0) {
      return `Choosen algorithm does not define any attributes for ${type}s.`
    }

    let definitionsString = `${firstCharCap(type)}s attributes:\n`
    Object.entries(definitions).forEach(([name, description]) => {
      definitionsString += `${name} - ${description}\n`;
    });
    return definitionsString;
  }
}
