import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import Graph from 'graphology';
import {random} from 'graphology-layout';
import {Sigma} from 'sigma';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container: ElementRef|null = null;
  @Input('graph') graph: Graph = new Graph();
  sigma?: Sigma;

  ngAfterViewInit(): void {
    this.graph.addNode('John', {size: 5, label: 'John', color: 'blue'});
    this.graph.addNode('Martha', {size: 3, label: 'Mary', color: 'red'});

    this.graph.addEdge('John', 'Martha');
    random.assign(this.graph);
    this.sigma = new Sigma(this.graph, this.container?.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.sigma) {
      this.sigma.kill();
    }
  }

  clear(): void {}
}
