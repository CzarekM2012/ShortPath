import {Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';

import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-element-info-display',
  templateUrl: './element-info-display.component.html',
  styleUrls: ['./element-info-display.component.css']
})
export class ElementInfoDisplayComponent implements OnChanges {
  @ViewChild('content') private content?: ElementRef<HTMLElement>;
  @Input() choosenElement?: ElementDescriptor;
  @Input() executing!: boolean;

  constructor(private graphStorage: GraphStorageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // first input check happens before HTMLElement linked to content has been
    // initialized
    if (this.content !== undefined) {
      if ('executing' in changes) {
        const inputs =
            Array.from(this.content.nativeElement.querySelectorAll('input'));
        inputs.forEach((input) => {
          input.disabled = this.executing;
        });
      }
      if ('choosenElement' in changes) {
        // element whose data was displayed has been unchecked/removed or an
        // edge was choosen
        if (this.choosenElement === undefined ||
            this.choosenElement.type == 'edge') {
          this.content.nativeElement.replaceChildren(
              'Choose a node to set it as the start or the end of the path');
        } else {
          const startLabel = document.createElement('label');
          startLabel.setAttribute('for', 'startRadio');
          startLabel.textContent = `start node:\t`;
          const startInput = document.createElement('input');
          startInput.id = 'startRadio'
          startInput.type = 'radio';
          startInput.name = 'chooseEnd'
          startInput.disabled = this.executing;
          startInput.onchange = () => {
            this.graphStorage.setPathEnd(this.choosenElement!.key, 'start');
          };
          if (this.choosenElement.key == this.graphStorage.pathEnds.startNode)
            startInput.checked = true;

          const endLabel = document.createElement('label');
          endLabel.setAttribute('for', 'endRadio');
          endLabel.textContent = `end node:\t`;
          const endInput = document.createElement('input');
          endInput.id = 'endRadio'
          endInput.type = 'radio';
          endInput.name = 'chooseEnd'
          endInput.disabled = this.executing;
          endInput.onchange = () => {
            this.graphStorage.setPathEnd(this.choosenElement!.key, 'end');
          };
          if (this.choosenElement.key == this.graphStorage.pathEnds.endNode)
            endInput.checked = true;

          const nodes: HTMLElement[] =
              [startLabel, startInput, endLabel, endInput];
          this.content.nativeElement.replaceChildren(...nodes);
        }
      }
    }
  }
}
