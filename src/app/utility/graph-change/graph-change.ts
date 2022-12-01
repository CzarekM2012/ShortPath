import Graph from 'graphology';

import {ElementDescriptor} from '../types';

const COLORS = {
  'inspect': 'yellow',
  'approve': 'green',
  'reject': 'red',
};

export class GraphChange {
  element: ElementDescriptor;
  property: string;
  formerValue: any;
  newValue: any;
  constructor(
      element: ElementDescriptor, property: string, formerValue: any,
      newValue: any) {
    this.element = element;
    this.property = property;
    this.formerValue = formerValue;
    this.newValue = newValue;
  }

  static markElement(
      graph: Graph, element: ElementDescriptor,
      type: 'inspect'|'approve'|'reject'): GraphChange {
    const markingProperty = 'color';
    let currentValue;
    if (element.type == 'edge')
      currentValue = graph.getEdgeAttribute(element.key, markingProperty);
    else
      currentValue = graph.getNodeAttribute(element.key, markingProperty);
    const change =
        new GraphChange(element, markingProperty, currentValue, COLORS[type]);
    // change is applied in order to maintain continuity of formerValue and
    // newValue between stages, need to think of a better way to realize it
    change.apply(graph);
    return change;
  }

  static setProperty(
      graph: Graph, element: ElementDescriptor, propertyName: string,
      value: any): GraphChange {
    let currentValue;
    if (element.type == 'edge')
      currentValue = graph.getEdgeAttribute(element.key, propertyName);
    else
      currentValue = graph.getNodeAttribute(element.key, propertyName);
    if (currentValue === undefined)
      console.error(`Attempt to set value of nonexistent ${
          element.type} property ${propertyName}.`);
    const change = new GraphChange(element, propertyName, currentValue, value);
    // change is applied in order to maintain continuity of formerValue and
    // newValue between stages, need to think of a better way to realize it
    change.apply(graph);
    return change;
  }

  static areRedundant(change: GraphChange, other: GraphChange) {
    return change.element == other.element && change.property == other.property;
  }

  apply(graph: Graph) {
    if (this.element.type == 'edge') {
      graph.setEdgeAttribute(this.element.key, this.property, this.newValue);
      return;
    }
    graph.setNodeAttribute(this.element.key, this.property, this.newValue);
  }

  reverse(graph: Graph) {
    if (this.formerValue === undefined) {
      if (this.element.type == 'edge') {
        graph.removeEdgeAttribute(this.element.key, this.property);
      } else {
        graph.removeNodeAttribute(this.element.key, this.property);
      }
    } else {
      if (this.element.type == 'edge') {
        graph.setEdgeAttribute(
            this.element.key, this.property, this.formerValue);
      } else {
        graph.setNodeAttribute(
            this.element.key, this.property, this.formerValue);
      }
    }
  }
}
