/**
 * These functions should be inside functions.ts file but it causes circular
 * dependency to occur - it should be investigated and fixed if possible, when
 * all required functions are ready
 */
import Graph from 'graphology';
import {largestConnectedComponentSubgraph} from 'graphology-components';

import {GraphChange} from './graph-change/graph-change';
import {ElementDescriptor, ElementType, GraphCheckResult} from './types';

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

export function hasElement(graph: Graph, element: ElementDescriptor) {
  if (element.type == 'edge')
    return graph.hasEdge(element.key);
  else
    return graph.hasNode(element.key);
}

export namespace GraphChecks {
  export namespace staticChecks {
    export function isConnected(graph: Graph): GraphCheckResult {
      const largestSubgraph = largestConnectedComponentSubgraph(graph);
      if (largestSubgraph.order == graph.order)
        return {message: '', markings: []};
      const markings: GraphChange[] = [];
      graph.forEachNode((node) => {
        if (!largestSubgraph.hasNode(node))
          markings.push(GraphChange.markElement(
              graph, new ElementDescriptor(node, 'node'), 'error'));
      });
      return {
        message: 'A path between any pair of nodes in graph must exist',
        markings
      };
    }
  }
  export namespace dynamicChecks {
    /**
     * Checks if value of specified attribute is within given range for each
     * element of specified type in graph
     * @param graph Graph that the check should be performed on
     * @param elementType Specification of whether the check should be performed
     *     on nodes or edges
     * @param attributeName Name of the attribute that should be checked
     * @param min Minimum value allowed for specified attribute
     * @param max Maximum value allowed for specified attribute
     *
     * Since mechanisms of retrieval of values of attributes from graph do not
     * return typed values, it is up to the user to make sure that values of
     * `min` and `max` are comparable with value of specified attribute
     * @returns GraphChange[] describing markings of elements not meeting the
     *     condition, empty if condition is met
     */
    export function areAttributesInRange(
        graph: Graph, elementType: ElementType, attributeName: string,
        range: {min?: any, max?: any}): GraphCheckResult {
      const {min, max} = range;
      if (min === undefined && max === undefined)
        return {message: '', markings: []};

      // TODO: Investigate why importing assert doesn't work in this file,
      // despite the fact it works in graph-storage.service.ts
      if (min !== undefined && max !== undefined) {
        if (!(min <= max))
          throw new Error(
              'areAttributesInRange in range GraphCheck is called improperly, conditions min <= max should be met');
      }
      const markings: GraphChange[] = [];

      if (elementType == 'edge') {
        graph.forEachEdge((edge) => {
          const value = graph.getEdgeAttribute(edge, attributeName);
          if (min !== undefined && min > value) {
            markings.push(GraphChange.markElement(
                graph, new ElementDescriptor(edge, elementType), 'error'));
            return;
          }
          if (max !== undefined && max < value) {
            markings.push(GraphChange.markElement(
                graph, new ElementDescriptor(edge, elementType), 'error'));
          }
        });
      } else {
        graph.forEachNode((node) => {
          const value = graph.getNodeAttribute(node, attributeName);
          if (min !== undefined && min > value) {
            markings.push(GraphChange.markElement(
                graph, new ElementDescriptor(node, elementType), 'error'));
            return;
          }
          if (max !== undefined && max < value) {
            markings.push(GraphChange.markElement(
                graph, new ElementDescriptor(node, elementType), 'error'));
          }
        });
      }
      let message = '';
      if (markings.length > 0) {
        message = `Value of ${attributeName} on each ${elementType} must be ${
            min !== undefined ?
                `higher than or equal to ${min}` :
                ''}${min !== undefined && max !== undefined ? ' and ' : ''}${
            max !== undefined ? `lower than or equal to ${max}` : ''}.`
      }
      return {message, markings};
    }
  }
}

export function firstCharCap(word: string): string {
  const fistChar = word.slice(0, 1);
  const restOfTheWord = word.slice(1);
  return fistChar.toUpperCase() + restOfTheWord;
}
