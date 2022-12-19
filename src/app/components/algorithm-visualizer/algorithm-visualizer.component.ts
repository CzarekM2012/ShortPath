import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {ChangeEmitterService} from '../../services/change-emitter/change-emitter.service';
import {ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-algorithm-visualizer',
  templateUrl: './algorithm-visualizer.component.html',
  styleUrls: ['./algorithm-visualizer.component.css']
})
export class AlgorithmVisualizerComponent implements AfterViewInit {
  @ViewChild('stageDescription') stageDescription!: ElementRef<HTMLElement>;
  elementDescriptor?: ElementDescriptor;
  subscriptions: Subscription = new Subscription();

  constructor(private changeEmitter: ChangeEmitterService) {}

  ngAfterViewInit(): void {
    this.subscriptions.add(
        this.changeEmitter.stageDescriptionChange.subscribe((description) => {
          this.stageDescription.nativeElement.innerText = description;
        }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  elementChoice(event: ElementDescriptor) {
    this.elementDescriptor = event;
  }
}
