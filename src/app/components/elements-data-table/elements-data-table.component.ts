import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {graphAlgorithms} from '../../algorithms/register';
import {ChangeEmitterService} from '../../services/change-emitter/change-emitter.service';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {getTypeCastedValue} from '../../utility/functions';
import {globalSettings} from '../../utility/globalSettings';
import {getElementAttribute, setElementAttribute} from '../../utility/graphFunctions';
import {AttributeDescriptor, ElementDescriptor, ElementType} from '../../utility/types';

const CHOOSEN_ELEMENT_PROPERTY_NAME = 'choosenElement';

@Component({
  selector: 'app-elements-data-table',
  templateUrl: './elements-data-table.component.html',
  styleUrls: ['./elements-data-table.component.css']
})
export class ElementsDataTableComponent implements AfterViewInit, OnChanges,
                                                   OnDestroy {
  @ViewChild('nodesTable') private nodesTable!: ElementRef<HTMLTableElement>;
  @ViewChild('edgesTable') private edgesTable!: ElementRef<HTMLTableElement>;
  @Input() executing!: boolean;
  @Input() choosenElement?: ElementDescriptor;
  protected viewing: ElementType = 'node';
  private rows: {
    nodes: {header?: HTMLTableRowElement, elements: HTMLTableRowElement[]},
    edges: {header?: HTMLTableRowElement, elements: HTMLTableRowElement[]},
  } = {nodes: {elements: []}, edges: {elements: []}};
  private subscriptions = new Subscription();

  constructor(
      private graphStorage: GraphStorageService,
      private changeEmitter: ChangeEmitterService) {}

  ngAfterViewInit(): void {
    this.subscriptions.add(
        this.changeEmitter.graphElementRemoved.subscribe((notification) => {
          if (notification == 'all') {
            this.rows.edges.elements = [];
            this.rows.nodes.elements = [];
            this.refreshTable();
          } else {
            const table = notification.type == 'node' ?
                this.rows.nodes.elements :
                this.rows.edges.elements;
            const indexToRemove = table.findIndex((row) => {
              return row.id == notification.key;
            });
            table.splice(indexToRemove, 1);
            this.refreshTable();
          }
        }));
    this.subscriptions.add(
        this.changeEmitter.graphElementAdded.subscribe((notification) => {
          if (notification == 'all') {
            this.generateContents();
            this.refreshTable();
          } else {
            this.generateElementRow(notification);
            this.refreshTable();
          }
        }));
    const algorithm = graphAlgorithms[this.graphStorage.getChoosenAlgorithm()];
    this.generateHeaderRow('node', algorithm.nodeProperties);
    this.generateHeaderRow('edge', algorithm.edgeProperties);
    this.generateContents();
    this.refreshTable();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('executing' in changes) {
      // ngOnChanges executes once before view has been initialized
      if (this.nodesTable !== undefined && this.edgesTable !== undefined) {
        console.log(`executing: ${this.executing}`);
        const inputs =
            Array.from(this.nodesTable.nativeElement.querySelectorAll('input'));
        inputs.push(...Array.from(
            this.edgesTable.nativeElement.querySelectorAll('input')));
        console.log(inputs);
        inputs.forEach((input) => {
          input.disabled = this.executing;
        });
      };
    }
    if (CHOOSEN_ELEMENT_PROPERTY_NAME in changes) {
      const previouslyChoosen: ElementDescriptor|undefined =
          changes[CHOOSEN_ELEMENT_PROPERTY_NAME].previousValue;
      if (previouslyChoosen !== undefined) {
        const row = this.findRow(previouslyChoosen);
        if (row !== undefined) row.style.backgroundColor = '';
      }
      const currentlyChoosen: ElementDescriptor|undefined =
          changes[CHOOSEN_ELEMENT_PROPERTY_NAME].currentValue;
      if (currentlyChoosen !== undefined) {
        const row = this.findRow(currentlyChoosen);
        if (row !== undefined) {
          if (this.viewing != currentlyChoosen.type) {
            this.viewing = currentlyChoosen.type;
            setTimeout(() => {
              row.scrollIntoView();
            }, 50);
          } else {
            row.scrollIntoView();
          }
          row.style.backgroundColor = globalSettings.markingColors['choose'];
        }
      }
    }
  }

  private generateHeaderRow(
      elementType: ElementType, attributes?: AttributeDescriptor[]) {
    if (attributes === undefined)
      attributes = elementType == 'node' ?
          graphAlgorithms[this.graphStorage.getChoosenAlgorithm()]
              .nodeProperties :
          graphAlgorithms[this.graphStorage.getChoosenAlgorithm()]
              .edgeProperties;

    const headerRow = document.createElement('tr');
    const labelColumnHeader = document.createElement('th');
    labelColumnHeader.innerText = elementType;
    headerRow.appendChild(labelColumnHeader);
    attributes.forEach((attribute) => {
      const columnHeader = document.createElement('th');
      columnHeader.innerText = attribute.name;
      headerRow.appendChild(columnHeader);
    });
    if (elementType == 'node') {
      this.rows.nodes.header = headerRow;
    } else {
      this.rows.edges.header = headerRow;
    }
  }

  private generateElementRow(
      element: ElementDescriptor, attributes?: AttributeDescriptor[]) {
    if (attributes === undefined)
      attributes = element.type == 'node' ?
          graphAlgorithms[this.graphStorage.getChoosenAlgorithm()]
              .nodeProperties :
          graphAlgorithms[this.graphStorage.getChoosenAlgorithm()]
              .edgeProperties;

    const row = document.createElement('tr');
    row.id = element.key;
    const labelCell = document.createElement('td');
    if (element.type == 'node') {
      labelCell.innerText =
          this.graphStorage.graph.getNodeAttribute(element.key, 'label');
    } else {
      const ends = this.graphStorage.graph.extremities(element.key);
      const labels = ends.map((node) => {
        return this.graphStorage.graph.getNodeAttribute(node, 'label');
      });
      labelCell.innerText = `${labels[0]}<=>${labels[1]}`;
    }
    row.appendChild(labelCell);
    attributes.forEach((attribute) => {
      if (attribute.visible) {
        row.appendChild(this.generateAttributeCell(element, attribute));
      }
    });
    if (element.type == 'node')
      this.rows.nodes.elements.push(row);
    else
      this.rows.edges.elements.push(row)
  }

  private generateAttributeCell(
      element: ElementDescriptor,
      attribute: AttributeDescriptor): HTMLTableCellElement {
    let tableCell = document.createElement('td');
    if (attribute.userModifiable) {
      const input = document.createElement('input');
      input.type = 'number';
      input.disabled = this.executing;
      const value =
          getElementAttribute(this.graphStorage.graph, element, attribute.name);
      input.value = value;
      input.onchange = () => {
        setElementAttribute(
            this.graphStorage.graph, element, attribute.name,
            getTypeCastedValue(input));
      };
      tableCell.appendChild(input);
    } else {
      tableCell.innerText =
          getElementAttribute(this.graphStorage.graph, element, attribute.name);
    }
    return tableCell;
  }

  private orderElementRows(rows: HTMLTableRowElement[]) {
    rows.sort((a, b) => {
      const aLabel = a.querySelector('td')!.innerText;
      const bLabel = b.querySelector('td')!.innerText;
      if (aLabel < bLabel)
        return -1;
      else
        return 1;
    });
  }

  private refreshTable() {
    if (this.rows.nodes.elements.length > 0) {
      this.orderElementRows(this.rows.nodes.elements);
      this.nodesTable.nativeElement.replaceChildren(
          this.rows.nodes.header!, ...this.rows.nodes.elements);
    } else {
      this.nodesTable.nativeElement.replaceChildren('No nodes to show');
    }

    if (this.rows.edges.elements.length > 0) {
      this.orderElementRows(this.rows.edges.elements);
      this.edgesTable.nativeElement.replaceChildren(
          this.rows.edges.header!, ...this.rows.edges.elements);
    } else {
      this.edgesTable.nativeElement.replaceChildren('No edges to show');
    }
  }

  private generateContents() {
    const algorithm = graphAlgorithms[this.graphStorage.getChoosenAlgorithm()];

    this.graphStorage.graph.forEachNode((node) => {
      const descriptor = new ElementDescriptor(node, 'node');
      this.generateElementRow(descriptor, algorithm.nodeProperties);
    });

    this.graphStorage.graph.forEachEdge((edge) => {
      const descriptor = new ElementDescriptor(edge, 'edge');
      this.generateElementRow(descriptor, algorithm.edgeProperties);
    });
  }

  private findRow(element: ElementDescriptor) {
    const table = element.type == 'node' ? this.rows.nodes.elements :
                                           this.rows.edges.elements;
    return table.find((row) => {return row.id == element.key});
  }
}
