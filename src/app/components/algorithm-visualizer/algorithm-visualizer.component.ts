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
  @ViewChild('stageDescription')
  private stageDescription!: ElementRef<HTMLElement>;
  private subscriptions: Subscription = new Subscription();
  protected choosenElement?: ElementDescriptor;
  protected executing: boolean = false;

  constructor(private changeEmitter: ChangeEmitterService) {}

  ngAfterViewInit(): void {
    this.subscriptions.add(
        this.changeEmitter.stageDescriptionChange.subscribe((description) => {
          this.stageDescription.nativeElement.innerText = description;
        }));
    this.subscriptions.add(
        this.changeEmitter.graphElementRemoved.subscribe((notification) => {
          if (this.choosenElement !== undefined &&
              (notification == 'all' ||
               notification.isEqualTo(this.choosenElement)))
            this.choosenElement = undefined;
        }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
