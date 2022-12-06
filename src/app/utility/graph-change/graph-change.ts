import Graph from 'graphology';

import {getElementAttribute, removeElementAttribute, setElementAttribute} from '../graphFunctions';
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
    const currentValue = getElementAttribute(graph, element, markingProperty);
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
    const currentValue = getElementAttribute(graph, element, propertyName);
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
    setElementAttribute(graph, this.element, this.property, this.newValue);
  }

  reverse(graph: Graph) {
    if (this.formerValue === undefined) {
      removeElementAttribute(graph, this.element, this.property);
    } else {
      setElementAttribute(graph, this.element, this.property, this.formerValue);
    }
  }
}
