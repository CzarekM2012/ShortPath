/**
 * These functions should be inside functions.ts file but it causes circular
 * dependency to occur - it should be investigated and fixed if possible, when
 * all required functions are ready
 */

import Graph from 'graphology';

import {ElementDescriptor} from './types';

export function getElementAttribute(
    graph: Graph, element: ElementDescriptor, attributeName: string|number) {
  if (element.type == 'edge')
    return graph.getEdgeAttribute(element.key, attributeName);
  else
    return graph.getNodeAttribute(element.key, attributeName);
}

export function removeElementAttribute(
    graph: Graph, element: ElementDescriptor, attributeName: string|number) {
  if (element.type == 'edge')
    return graph.removeEdgeAttribute(element.key, attributeName);
  else
    return graph.removeNodeAttribute(element.key, attributeName);
}

export function setElementAttribute(
    graph: Graph, element: ElementDescriptor, attributeName: string|number,
    value: any) {
  if (element.type == 'edge')
    graph.setEdgeAttribute(element.key, attributeName, value);
  else
    graph.setNodeAttribute(element.key, attributeName, value);
}
