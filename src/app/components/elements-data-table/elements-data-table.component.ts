import {AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';

import {graphAlgorithms} from '../../algorithms/register';
import {ChangeEmitterService} from '../../services/change-emitter/change-emitter.service';
import {GraphStorageService} from '../../services/graph-storage/graph-storage.service';
import {getTypeCastedValue} from '../../utility/functions';
import {getElementAttribute, setElementAttribute} from '../../utility/graphFunctions';
import {AttributeDescriptor, ElementDescriptor, ElementType} from '../../utility/types';

@Component({
  selector: 'app-elements-data-table',
  templateUrl: './elements-data-table.component.html',
  styleUrls: ['./elements-data-table.component.css']
})
export class ElementsDataTableComponent implements AfterViewInit, OnChanges {
  @ViewChild('nodesTable') private nodesTable!: ElementRef<HTMLTableElement>;
  @ViewChild('edgesTable') private edgesTable!: ElementRef<HTMLTableElement>;
  @Input() executing!: boolean;
  protected viewing: ElementType = 'node';
  private rows: {
    nodes: {header?: HTMLTableRowElement, elements: HTMLTableRowElement[]},
    edges: {header?: HTMLTableRowElement, elements: HTMLTableRowElement[]},
  } = {nodes: {elements: []}, edges: {elements: []}};

  constructor(private graphStorage: GraphStorageService) {}

  ngAfterViewInit(): void {
    if (this.graphStorage.getChoosenAlgorithm() in graphAlgorithms) {
      const algorithm =
          graphAlgorithms[this.graphStorage.getChoosenAlgorithm()];

      this.rows.nodes.header =
          this.generateHeaderRow('node', algorithm.nodeProperties);
      this.graphStorage.graph.forEachNode((node) => {
        const descriptor = new ElementDescriptor(node, 'node');
        const row =
            this.generateElementRow(descriptor, algorithm.nodeProperties);
        this.rows.nodes.elements.push(row);
      });

      this.rows.edges.header =
          this.generateHeaderRow('edge', algorithm.edgeProperties);
      this.graphStorage.graph.forEachEdge((edge) => {
        const descriptor = new ElementDescriptor(edge, 'edge');
        const row =
            this.generateElementRow(descriptor, algorithm.edgeProperties);
        this.rows.edges.elements.push(row);
      });

      this.refreshTable();
    }
  }

  ngOnChanges(): void {
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

  private generateHeaderRow(
      elementType: ElementType,
      attributes: AttributeDescriptor[]): HTMLTableRowElement {
    const headerRow = document.createElement('tr');
    const labelColumnHeader = document.createElement('th');
    labelColumnHeader.innerText = elementType;
    headerRow.appendChild(labelColumnHeader);
    attributes.forEach((attribute) => {
      const columnHeader = document.createElement('th');
      columnHeader.innerText = attribute.name;
      headerRow.appendChild(columnHeader);
    });
    return headerRow;
  }

  private generateElementRow(
      element: ElementDescriptor,
      attributes: AttributeDescriptor[]): HTMLTableRowElement {
    const row = document.createElement('tr');
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
    return row;
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
    this.orderElementRows(this.rows.nodes.elements);
    this.orderElementRows(this.rows.edges.elements);
    this.nodesTable.nativeElement.replaceChildren(
        this.rows.nodes.header!, ...this.rows.nodes.elements);
    this.edgesTable.nativeElement.replaceChildren(
        this.rows.edges.header!, ...this.rows.edges.elements);
  }
}