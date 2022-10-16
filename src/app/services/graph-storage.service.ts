import {Injectable} from '@angular/core';
import Graph from 'graphology';

@Injectable({providedIn: 'root'})
export class GraphStorageService {
  graph: Graph = new Graph();

  constructor() {
    this.addDefaultNode('1');
    this.addDefaultNode('2');
    this.addDefaultNode('3');
    this.addDefaultNode('4');
    this.addDefaultNode('5');
    this.graph.addEdge('1', '2');
    this.graph.addEdge('2', '3');
    this.graph.addEdge('3', '4');
    this.graph.addEdge('4', '5');
    this.graph.addEdge('5', '1');
    this.graph.addEdge('1', '4');
    this.graph.addEdge('2', '5');
  }

  addDefaultNode(name: string) {
    this.graph.addNode(name, {size: 5, label: name, color: 'blue'});
  }
}
