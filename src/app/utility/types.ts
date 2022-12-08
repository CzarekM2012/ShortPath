import Graph from 'graphology';

import {ExecutionStage} from './execution-stage/execution-stage';
import {GraphChange} from './graph-change/graph-change';

export type DisplayState = 'choose'|'addNode'|'addEdge'|'remove';

export type ElementType = 'node'|'edge';

export interface ElementDescriptor {
  key: string;
  type: ElementType;
}


/**
 * Algorithms are going to be used mainly in Web Workers that will send
 * ExecutionStage objects as soon as they are complete.
 *
 * Algorithms called in main thread could return full execution stack after
 * finishing.
 *
 * Providing external execution stack that can be pushed to at the same moments
 * when Web Worker implementation would send messages makes it easier to reuse
 * Web Worker implementation in main thread.
 */
export type mainThreadAlgorithmCall =
    (executionStack: ExecutionStage[], graph: Graph, source: string,
     destination: string) => void;

export type GraphCheckResult = {
  message: string,
  markings: GraphChange[],
}

export type GraphCheck = (graph: Graph) => GraphCheckResult;

export type AttributeDescriptor = {
  name: string,
  defaultValue: number,
  visible: boolean,
  userModifiable: boolean,
}
