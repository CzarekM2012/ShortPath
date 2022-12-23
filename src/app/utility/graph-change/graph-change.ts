import Graph from 'graphology';

import {globalSettings} from '../globalSettings';
import {getElementAttribute, removeElementAttribute, setElementAttribute} from '../graphFunctions';
import {ElementDescriptor} from '../types';

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

  /**
   * Mark an element of the graph by changing its colour
   * @param graph Graph on which element should be marked
   * @param element Descriptor of the element that should be marked
   * @param type Keyword associated with colour. Colours under `'choose'` and
   *     `'error'` are treated by following markings of an element as default
   *     and should not be used in the context of an algorithm
   * @returns An instance of GraphChange representing the marking of an element
   */
  static markElement(
      graph: Graph, element: ElementDescriptor,
      type: 'inspect'|'approve'|'reject'|'choose'|'error'): GraphChange {
    const markingProperty = 'color';
    let currentValue = getElementAttribute(graph, element, markingProperty);
    // TODO: Think of a better way to separate markings that should be ignored
    // by markings from algorithm execution
    if (currentValue in
            [globalSettings.markingColors['choose'],
             globalSettings.markingColors['error']])
      currentValue = undefined;
    const change = new GraphChange(
        element, markingProperty, currentValue,
        globalSettings.markingColors[type]);
    // change is applied immediately in order to maintain continuity of
    // formerValue and newValue between stages, need to think of a better way to
    // realize it
    change.apply(graph);
    return change;
  }

  /**
   * Set value of an elements property. Changing colour of an element using this
   * function is not recommended, `markElement` function should be used instead
   * @param graph Graph on which element should have its property set
   * @param element Descriptor of the element that should have its property set
   * @param propertyName Name of property that should be set
   * @param value Value that property should be set to. Since methods of
   *     retrieval of values doesn't allow determining datatype of value before
   *     set, maintaining the datatype falls upon the user
   * @returns An instance of GraphChange representing the setting of the
   *     property
   */
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
