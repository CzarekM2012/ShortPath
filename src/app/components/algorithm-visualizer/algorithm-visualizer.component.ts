import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {environment} from '../../../environments/environment';
import {AlgorithmSolutionService} from '../../services/algorithm-solution/algorithm-solution.service';
import {ChangeEmitterService} from '../../services/change-emitter/change-emitter.service';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
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
  protected readyToVisualize: boolean =
      this.graphStorage.isValidAlgorithmChoosen();
  protected production: boolean = environment.production;

  constructor(
      private changeEmitter: ChangeEmitterService,
      protected algorithmSolution: AlgorithmSolutionService,
      protected graphStorage: GraphStorageService) {}

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
