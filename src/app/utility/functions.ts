import {graphAlgorithms} from '../algorithms/register';

import {AttributeDescriptor} from './types';

/**
 * Since both empty inputs and those with strings that are not considered
 * numbers, but can be written (such as "123-46.58") have value equal to '',
 * functions from "EnforceNumberInput" also have an effect of replacing improper
 * strings in inputs.
 */
export namespace EnforceNumberInput {
  /**
   * Enforces value range limitations of number HTMLInputElement that can be
   * bypassed by writing value directly
   * @param input Number HTMLInputElement object
   */
  export function enforceRange(input: HTMLInputElement) {
    let value = Number(input.value);
    if (input.min != '' && value < Number(input.min)) {
      const min = Number(input.min);
      if (value < min) value = min;
    }
    if (input.max != '') {
      const max = Number(input.max);
      if (value > max) value = max;
    }
    input.value = value.toString();
  }

  /**
   * Forcibly changes value of number HTMLInputElement to integer by truncating
   * digits after decimal point
   * @param input Number HTMLInputElement object
   */
  export function enforceInteger(input: HTMLInputElement) {
    input.value = Math.trunc(Number(input.value)).toString();
  }
}
/**
 * Inputs of types: number, string are supported
 * @param input HTMLInputElement object
 * @returns Value of passed input. Value is returned as object of type
 *     appropriate to type property of input object
 */
export function getTypeCastedValue(input: HTMLInputElement) {
  switch (input.type) {
    case 'number':
      return Number(input.value);
    default:
      return input.value;
  }
}

/**
 * @param nodes Number of nodes in graph
 * @returns Minimal number of edges necessary for path between any pair of nodes
 *     in the graph to exist
 */
export function minEdgesForConnectedGraph(nodes: number) {
  return nodes - 1;
}

/**
 * @param nodes Number of nodes in graph
 * @returns Number of edges in fully connected graph with given number of nodes.
 *     Maximum number of edges possible to create in graph for any pair of
 *     neighbour nodes to be connected with a single edge
 */
export function maxEdgesForConnectedGraph(nodes: number) {
  return nodes * (nodes - 1) / 2;
}

/**
 * Analyzes what changes should be made during change between attributes sets
 * @param current Array containing descriptors of element attributes for
 *     currently choosen graph algorithm
 * @param target Array containing descriptors of element attributes for graph
 *     algorithm that graph should be adjusted to
 * @returns Object describing what attributes should be added, removed or have
 *     their values replaced
 */
function analyzeAttributeChanges(
    current: AttributeDescriptor[], target: AttributeDescriptor[]): {
  add: AttributeDescriptor[],
  remove: AttributeDescriptor[],
  replace: AttributeDescriptor[]
} {
  // Attributes present in target set, but not in current set should be added
  const toAdd = target.filter((targetDesc) => {
    const sameNameAttribute = current.find((currentDesc) => {
      return currentDesc.name == targetDesc.name;
    });
    return sameNameAttribute === undefined;
  });

  let toRemove: AttributeDescriptor[] = [];
  let commonNames: AttributeDescriptor[][] = [];
  // Attributes present in current set, but not in target set should be removed
  current.forEach((currentDesc) => {
    const sameNameAttribute = target.find((targetDesc) => {
      return currentDesc.name == targetDesc.name;
    });
    if (sameNameAttribute === undefined) {
      toRemove.push(currentDesc);
    } else {
      // Filling structure that will be used for datatypes comparison
      commonNames.push([currentDesc, sameNameAttribute]);
    }
  })
  let toReplace: AttributeDescriptor[] = [];
  // If datatypes match, attribute should be left alone, since user could have
  // set its value to one he wanted, otherwise replace value
  commonNames.forEach(([currentDesc, targetDesc]) => {
    if (typeof currentDesc.defaultValue != typeof targetDesc.defaultValue) {
      toReplace.push(targetDesc);
    }
  });
  return {add: toAdd, remove: toRemove, replace: toReplace};
}

/**
 * Analyzes what changes should be made to attributes of graph elements during
 * algorithm change
 * @param currentAlgorithm Identifier of currently choosen algorithm
 * @param newAlgorithm Identifier of newly choosen algorithm
 * @returns Object containing descriptors of edge and node attributes that
 *     should be added, removed or have their values replaced during algorithm
 *     change.
 */
export function analyzeAlgorithmChange(
    currentAlgorithm: string, newAlgorithm: string) {
  let currentNode: AttributeDescriptor[] = [];
  let newNode: AttributeDescriptor[] = [];
  let currentEdge: AttributeDescriptor[] = [];
  let newEdge: AttributeDescriptor[] = [];
  if (currentAlgorithm in graphAlgorithms) {
    currentNode = graphAlgorithms[currentAlgorithm].nodeProperties;
    currentEdge = graphAlgorithms[currentAlgorithm].edgeProperties;
  }
  if (newAlgorithm in graphAlgorithms) {
    newNode = graphAlgorithms[newAlgorithm].nodeProperties;
    newEdge = graphAlgorithms[newAlgorithm].edgeProperties;
  }
  return {
    nodes: analyzeAttributeChanges(currentNode, newNode),
    edges: analyzeAttributeChanges(currentEdge, newEdge),
  };
}
