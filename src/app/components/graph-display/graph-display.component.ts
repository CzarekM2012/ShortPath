import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {random} from 'graphology-layout';
import ForceSupervisor from 'graphology-layout-force/worker';
import {Sigma} from 'sigma';

import {GraphStorageService} from '../../services/graph-storage.service';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container: ElementRef|null = null;
  sigma?: Sigma;

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterViewInit(): void {
    random.assign(this.graphStorage.graph);
    const layout = new ForceSupervisor(this.graphStorage.graph)
    layout.start();
    this.sigma =
        new Sigma(this.graphStorage.graph, this.container?.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.sigma) {
      this.sigma.kill();
    }
  }

  clear(): void {}
}
