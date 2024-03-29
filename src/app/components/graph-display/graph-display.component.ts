import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {random} from 'graphology-layout';
import ForceSupervisor from 'graphology-layout-force/worker';
import {Subscription} from 'rxjs';
import {Sigma} from 'sigma';
import {Coordinates} from 'sigma/types';

import {ChangeEmitterService} from '../../services/change-emitter/change-emitter.service';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {EnforceNumberInput, maxEdgesForConnectedGraph, minEdgesForConnectedGraph} from '../../utility/functions';
import {globalSettings} from '../../utility/globalSettings';
import {GraphChange} from '../../utility/graph-change/graph-change';
import {getElementAttribute} from '../../utility/graphFunctions';
import {DisplayState, ElementDescriptor, ElementNotification} from '../../utility/types';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements OnInit, AfterViewInit, OnDestroy,
                                              OnChanges {
  @ViewChild('display') private display!: ElementRef;
  @ViewChild('numberOfNodes') private nodesInput!: ElementRef<HTMLInputElement>;
  @ViewChild('numberOfEdges') private edgesInput!: ElementRef<HTMLInputElement>;
  @Input() executing!: boolean;
  @Input() choosenElement?: ElementDescriptor;
  @Output()
  private choosenElementChange = new EventEmitter<ElementDescriptor>();
  private choosenMarking?: GraphChange;
  private renderer?: Sigma;
  private subscriptions: Subscription = new Subscription();
  // temporarily remembered node, used for adding edges and drag
  private tempNode?: string;
  private isDragging: boolean = false;
  protected layout: {
    worker?: ForceSupervisor, active: FormControl
  } = {active: new FormControl<Boolean>(true, {nonNullable: true})};
  protected state: FormControl =
      new FormControl<DisplayState>('choose', {nonNullable: true});
  // inputsSettings.maxNodes cannot be accessed during initialization of
  // inputsSettings, so minEdges and maxEdges have temporary values assigned,
  //  proper values are assigned in constructor
  protected inputsSettings: {
    maxNodes: number,  // also initial value of nodesInput
    minEdges: number,  // also initial value of edgesInput
    maxEdges: number,
  } = {maxNodes: globalSettings.graphMaxNodes, minEdges: -1, maxEdges: -1};

  constructor(
      private graphStorage: GraphStorageService,
      private changeEmitter: ChangeEmitterService) {
    this.inputsSettings.minEdges =
        minEdgesForConnectedGraph(this.inputsSettings.maxNodes);
    this.inputsSettings.maxEdges =
        maxEdgesForConnectedGraph(this.inputsSettings.maxNodes);
  }

  ngOnInit(): void {
    this.subscriptions.add(
        // layout control
        this.layout.active.valueChanges.subscribe((runLayout: Boolean) => {
          if (runLayout)
            this.layout.worker?.start();
          else
            this.layout.worker?.stop();
        }));
    this.subscriptions.add(this.changeEmitter.graphElementRemoved.subscribe(
        (notification: ElementNotification) => {
          if (this.choosenMarking !== undefined &&
              (notification == 'all' ||
               notification.isEqualTo(this.choosenMarking.element)))
            this.choosenMarking = undefined;
        }));
  }

  ngAfterViewInit(): void {
    this.nodesInput.nativeElement.value =
        this.inputsSettings.maxNodes.toString();
    this.edgesInput.nativeElement.value =
        this.inputsSettings.minEdges.toString();
    this.startRendering();
  }

  ngOnDestroy(): void {
    this.reverseChoiceMarking();
    this.stopRendering();
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('executing' in changes) {
      if (this.executing) {
        this.state.reset();
        this.state.disable();
      } else {
        this.state.enable();
      }
    }
    if ('choosenElement' in changes) {
      this.reverseChoiceMarking();
      if (this.choosenElement != undefined)
        this.choosenMarking = GraphChange.markElement(
            this.graphStorage.graph, this.choosenElement, 'choose');
    }
  }

  private reverseChoiceMarking() {
    if (this.choosenMarking !== undefined &&
        getElementAttribute(
            this.graphStorage.graph, this.choosenMarking.element, 'color') ==
            this.choosenMarking.newValue)
      this.choosenMarking.reverse(this.graphStorage.graph);
  }

  private stopRendering(): void {
    this.layout.worker?.kill();
    this.renderer?.kill();
  }

  private startRendering(): void {
    random.assign(this.graphStorage.graph);
    this.layout.worker = new ForceSupervisor(this.graphStorage.graph);
    this.layout.active.setValue(true);
    this.renderer =
        new Sigma(this.graphStorage.graph, this.display.nativeElement, {
          enableEdgeClickEvents: true,
          renderLabels: true,
          renderEdgeLabels: true,
          labelRenderedSizeThreshold: 0
        });

    this.renderer.on('clickStage', (event) => {
      if (this.state.value == 'addNode') {
        const {x, y} = event.event;
        const nodeCoords =
            this.renderer!.viewportToGraph({x, y}) as Coordinates;
        this.graphStorage.addNode(nodeCoords);
      }
    });

    this.renderer.on('clickNode', (event) => {
      switch (this.state.value) {
        case 'choose':
          this.choosenElementChange.emit(
              new ElementDescriptor(event.node, 'node'));
          break;
        case 'addEdge':
          if (this.tempNode == undefined) {
            this.tempNode = event.node;
            break;
          }
          if (this.tempNode != event.node) {
            this.graphStorage.addEdge(this.tempNode, event.node);
            this.tempNode = undefined;
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
          this.choosenElementChange.emit(
              new ElementDescriptor(event.edge, 'edge'));
          break;
        case 'remove':
          this.graphStorage.removeEdge(event.edge);
          break;
        default:
          break;
      }
    });

    this.renderer.on('downNode', (event) => {
      if (!(this.state.value == 'choose')) return;
      this.isDragging = true;
      this.tempNode = event.node;
      this.graphStorage.graph.setNodeAttribute(
          this.tempNode, 'highlighted', true);
      if (!this.renderer!.getCustomBBox())
        this.renderer!.setCustomBBox(this.renderer!.getBBox());
    });

    this.renderer.getMouseCaptor().on('mousemovebody', (event) => {
      if (!this.isDragging || this.tempNode === undefined) return;
      const position = this.renderer!.viewportToGraph(event);
      this.graphStorage.graph.setNodeAttribute(this.tempNode, 'x', position.x);
      this.graphStorage.graph.setNodeAttribute(this.tempNode, 'y', position.y);
      event.preventSigmaDefault();
      event.original.preventDefault();
      event.original.stopPropagation();
    });

    this.renderer.getMouseCaptor().on('mouseup', () => {
      if (!(this.state.value == 'choose')) return;
      if (this.tempNode !== undefined) {
        this.graphStorage.graph.removeNodeAttribute(
            this.tempNode, 'highlighted');
      }
      this.isDragging = false;
      this.tempNode = undefined;
      this.renderer!.setCustomBBox(null);
    });
  }

  protected randomGraph() {
    this.graphStorage.randomGraph(
        Number(this.nodesInput.nativeElement.value),
        Number(this.edgesInput.nativeElement.value));
    this.stopRendering();
    this.startRendering();
  }

  protected clearGraph() {
    this.graphStorage.clearGraph();
    this.stopRendering();
    this.startRendering();
  }

  protected handleNodesNumber() {
    EnforceNumberInput.enforceRange(this.nodesInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.nodesInput.nativeElement);

    const nodesNumber = Number(this.nodesInput.nativeElement.value);
    const edgesNumber = Number(this.edgesInput.nativeElement.value);
    this.inputsSettings.minEdges = minEdgesForConnectedGraph(nodesNumber);
    this.inputsSettings.maxEdges = maxEdgesForConnectedGraph(nodesNumber);
    if (edgesNumber < this.inputsSettings.minEdges)
      this.edgesInput.nativeElement.value =
          this.inputsSettings.minEdges.toString();
    else if (edgesNumber > this.inputsSettings.maxEdges)
      this.edgesInput.nativeElement.value =
          this.inputsSettings.maxEdges.toString();
  }

  protected handleEdgesNumber() {
    EnforceNumberInput.enforceRange(this.edgesInput.nativeElement);
    EnforceNumberInput.enforceInteger(this.edgesInput.nativeElement);
  }

  protected resetTempNode() {
    this.tempNode = undefined;
  }
}
