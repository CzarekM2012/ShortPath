import {Component, OnInit} from '@angular/core';

import {ElementDescriptor} from '../../types';

@Component({
  selector: 'app-gui',
  templateUrl: './gui.component.html',
  styleUrls: ['./gui.component.css']
})
export class GUIComponent implements OnInit {
  elementDescriptor?: ElementDescriptor;

  constructor() {}

  ngOnInit(): void {}

  elementChoice(event: ElementDescriptor) {
    this.elementDescriptor = event;
  }
}
