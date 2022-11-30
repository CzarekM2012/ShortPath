import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import Attributes from 'graphology';

import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {getTypeCastedValue} from '../../utility/functions';
import {ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-element-info-display',
  templateUrl: './element-info-display.component.html',
  styleUrls: ['./element-info-display.component.css']
})
export class ElementInfoDisplayComponent implements AfterViewInit, OnChanges {
  @ViewChild('display') display!: ElementRef;
  @Input() elementDescriptor?: ElementDescriptor;

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterViewInit(): void {}

  ngOnChanges() {
    if (this.elementDescriptor == undefined) return;
    let attributes = undefined;
    switch (this.elementDescriptor.type) {
      case 'node':
        attributes = this.graphStorage.graph.getNodeAttributes(
            this.elementDescriptor.key);
        break;
      case 'edge':
        attributes = this.graphStorage.graph.getEdgeAttributes(
            this.elementDescriptor.key);
        break;
      default:
        console.error(
            'Element info display tried to display data of an element of unsupported type');
        return;
    }
    const nodes = this.createInterface(attributes as Attributes).flat();
    (this.display.nativeElement as HTMLElement).replaceChildren(...nodes);
  }

  createInterface(object: Attributes) {
    const propertiesToHide = ['x', 'y'];
    let properties = Object.entries(object);
    properties = properties.filter(([key, _]) => {
      return !propertiesToHide.includes(key);
    });
    properties.sort(([keyA, _A], [keyB, _B]) => {
      if (keyA < keyB)
        return -1;
      else if (keyA > keyB)
        return 1;
      else
        return 0;
    });

    const nodes = properties.map(([key, value]) => {
      const label = document.createElement('label')
      label.setAttribute('for', key);
      label.textContent = `${key}:\t`;
      const input = document.createElement('input');
      input.name = key;
      input.value = value;
      switch (typeof value) {
        case 'number':
          input.type = 'number';
          break;
        default:
          input.type = 'string';
          break;
      }
      switch (this.elementDescriptor?.type) {
        case 'node':
          input.onchange = () => {
            this.graphStorage.graph.setNodeAttribute(
                this.elementDescriptor?.key, key, getTypeCastedValue(input));
          };
          break;
        case 'edge':
          input.onchange = () => {
            this.graphStorage.graph.setEdgeAttribute(
                this.elementDescriptor?.key, key, getTypeCastedValue(input));
          };
          break;
        default:
          break;
      }
      return [label, input];
    });
    return nodes;
  }
}
