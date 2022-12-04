import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {random} from 'graphology-layout';
import ForceSupervisor from 'graphology-layout-force/worker';
import {Subscription} from 'rxjs';
import {Sigma} from 'sigma';
import {Coordinates} from 'sigma/types';

import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {EnforceNumberInput, maxEdgesForConnectedGraph, minEdgesForConnectedGraph} from '../../utility/functions';
import {DisplayState, ElementDescriptor} from '../../utility/types';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('display') display!: ElementRef;
  @ViewChild('numberOfNodes') nodesInput!: ElementRef;
  @ViewChild('numberOfEdges') edgesInput!: ElementRef;
  @Output() choosenElement = new EventEmitter<ElementDescriptor>();
  state: FormControl =
      new FormControl<DisplayState>('choose', {nonNullable: true});
  renderer?: Sigma;
  layout: {
    worker?: ForceSupervisor, active: FormControl
  } = {active: new FormControl<Boolean>(true, {nonNullable: true})};
  subscriptions: Subscription = new Subscription();
  nodeKey?: string
  refreshSubscription: any;

  constructor(private graphStorage: GraphStorageService) {}

  ngOnInit(): void {
    this.refreshSubscription =
        this.graphStorage.graphicRefresh.subscribe((_) => {
          this.renderer?.refresh();
        });
    this.subscriptions.add(
        // layout control
        this.layout.active.valueChanges.subscribe((runLayout: Boolean) => {
          if (runLayout)
            this.layout.worker?.start();
          else
            this.layout.worker?.stop();
        }));
  }

  ngAfterViewInit(): void {
    this.startRendering();
  }

  ngOnDestroy(): void {
    this.stopRendering();
    this.refreshSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  stopRendering(): void {
    this.layout.worker?.kill();
    this.renderer?.kill();
  }

  startRendering(): void {
    random.assign(this.graphStorage.graph);
    this.layout.worker = new ForceSupervisor(this.graphStorage.graph);
    this.layout.active.setValue(true);
    this.renderer = new Sigma(
        this.graphStorage.graph, this.display.nativeElement,
        {enableEdgeClickEvents: true});
    this.renderer.on('clickStage', (event) => {
      if (this.state.value == 'addNode') {
        const {x, y} = event.event;
        const nodeCoords =
            this.renderer?.viewportToGraph({x, y}) as Coordinates;
        this.graphStorage.addNode(nodeCoords);
      }
    });
    this.renderer.on('clickNode', (event) => {
      switch (this.state.value) {
        case 'choose':
          this.choosenElement.emit({key: event.node, type: 'node'});
          break;
        case 'addEdge':
          if (this.nodeKey == undefined) {
            this.nodeKey = event.node;
            break;
          }
          if (this.nodeKey != event.node) {
            this.graphStorage.addEdge(this.nodeKey, event.node);
            this.nodeKey = undefined;
          }
          break;
        case 'remove':
          this.graphStorage.removeNode(event.node);
          break;
        default:
          break;
      }
    });
    this.renderer.on('clickEdge', (event) => {
      switch (this.state.value) {
        case 'choose':
          this.choosenElement.emit({key: event.edge, type: 'edge'});
          break;
        case 'remove':
          this.graphStorage.removeEdge(event.edge);
          break;
        default:
          break;
      }
    });
  }

  randomGraph() {
    this.graphStorage.randomGraph(
        this.nodesInput.nativeElement.value,
        this.edgesInput.nativeElement.value);
    this.stopRendering();
    this.startRendering();
  }

  handleNodesNumber() {
    const nodesInput = this.nodesInput.nativeElement as HTMLInputElement;
    EnforceNumberInput.enforceRange(nodesInput);
    EnforceNumberInput.enforceInteger(nodesInput);

    const nodesNumber = Number(nodesInput.value);
    const edgesInput = this.edgesInput.nativeElement as HTMLInputElement;
    const edgesNumber = Number(edgesInput.value);
    const minEdges = minEdgesForConnectedGraph(nodesNumber);
    const maxEdges = maxEdgesForConnectedGraph(nodesNumber);
    edgesInput.min = minEdges.toString();
    edgesInput.max = maxEdges.toString();
    if (edgesNumber < minEdges)
      edgesInput.value = edgesInput.min;
    else if (edgesNumber > maxEdges)
      edgesInput.value = edgesInput.max;
  }
  handleEdgesNumber() {
    EnforceNumberInput.enforceRange(this.edgesInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.edgesInput.nativeElement);
  }
}
