import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {getTypeCastedValue} from '../../utility/functions';
import {getElementAttribute, setElementAttribute} from '../../utility/graphFunctions';
import {AttributeDescriptor, ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-element-info-display',
  templateUrl: './element-info-display.component.html',
  styleUrls: ['./element-info-display.component.css']
})
export class ElementInfoDisplayComponent implements AfterViewInit, OnChanges {
  @ViewChild('display') display?: ElementRef;
  @Input() elementDescriptor?: ElementDescriptor;

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterViewInit(): void {}

  ngOnChanges() {
    // first input check before display has been linked to HTMLElement
    if (this.display === undefined) return;
    // element whose data was displayed has beend unchecked/removed
    if (this.elementDescriptor === undefined) {
      (this.display.nativeElement as HTMLElement)
          .replaceChildren('Choose a node or an edge');
      return;
    };
    let nodes: HTMLElement[][] = [];
    if (this.graphStorage.choosenAlgorithm in graphAlgorithms) {
      const attributes = this.elementDescriptor.type == 'edge' ?
          graphAlgorithms[this.graphStorage.choosenAlgorithm].edgeProperties :
          graphAlgorithms[this.graphStorage.choosenAlgorithm].nodeProperties;
      nodes = attributes.map((attribute) => {
        return this.createDataElement(
            attribute,
            getElementAttribute(
                this.graphStorage.graph, this.elementDescriptor!,
                attribute.name));
      });
    }

    if (this.elementDescriptor.type == 'node') {
      const startLabel = document.createElement('label');
      startLabel.setAttribute('for', 'startRadio');
      startLabel.textContent = `start node:\t`;
      const startInput = document.createElement('input');
      startInput.id = 'startRadio'
      startInput.type = 'radio';
      startInput.name = 'chooseEnd'
      startInput.onchange = () => {
        this.graphStorage.setPathEnd(this.elementDescriptor!.key, 'start');
      };
      if (this.elementDescriptor.key == this.graphStorage.pathEnds.startNode)
        startInput.checked = true;
      const endLabel = document.createElement('label');
      endLabel.setAttribute('for', 'endRadio');
      endLabel.textContent = `end node:\t`;
      const endInput = document.createElement('input');
      endInput.id = 'endRadio'
      endInput.type = 'radio';
      endInput.name = 'chooseEnd'
      endInput.onchange = () => {
        this.graphStorage.setPathEnd(this.elementDescriptor!.key, 'end');
      };
      if (this.elementDescriptor.key == this.graphStorage.pathEnds.endNode)
        endInput.checked = true;
      nodes.push([startLabel, startInput], [endLabel, endInput]);
    }
    (this.display.nativeElement as HTMLElement)
        .replaceChildren(...(nodes.flat()));
  }

  createDataElement(attribute: AttributeDescriptor, value: number): []|
      (HTMLLabelElement|HTMLInputElement)[]|
      (HTMLLabelElement|HTMLSpanElement)[] {
    if (!attribute.visible) {
      return [];
    }
    const label = document.createElement('label')
    label.setAttribute('for', attribute.name);
    label.textContent = `${attribute.name}:`;
    if (attribute.userModifiable) {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = attribute.name;
      input.value = value.toString();
      input.onchange = () => {
        setElementAttribute(
            this.graphStorage.graph, this.elementDescriptor!, attribute.name,
            getTypeCastedValue(input));
      };
      return [label, input];
    } else {
      const output = document.createElement('span');
      output.textContent = value.toString();
      return [label, output];
    }
  }
}
