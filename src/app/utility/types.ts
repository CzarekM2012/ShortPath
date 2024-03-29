import Graph from 'graphology';

import {ExecutionStage} from './execution-stage/execution-stage';
import {GraphChange} from './graph-change/graph-change';

export type DisplayState = 'choose'|'addNode'|'addEdge'|'remove';

export type AlgorithmDescriptionDisplayMode =
    'description'|'origin'|'pseudocode'|'definitions'|'references';

export type ElementType = 'node'|'edge';

export class ElementDescriptor {
  key: string;
  type: ElementType;
  constructor(key: string, type: ElementType) {
    this.key = key;
    this.type = type;
  }
  isEqualTo(other: ElementDescriptor) {
    return this.key == other.key && this.type == other.type;
  }
};

export type ElementNotification = ElementDescriptor|'all';

export type ElementAttributeChangeNotification = {
  element: ElementDescriptor,
  attribute: string,
  origin: 'manual'|'algorithm',
};

export type algorithmCallType = 'normal'|'mainThread';

/**
 * Web Workers are assumed environment of algorithm execution, however fallback
 * method for executing them in the main thread is necessary.
 *
 * submitStage callback is used in the implementation of the algorithm, in order
 * to avoid copy-pasting the same function and only changing the method of
 * submitting execution stage.
 *
 * In case of execution in the context of the webworker, submitStage will need
 * to be provided by algorithm implementation (it may be defined
 * as`(stage)=>{postMessage(stage);}` in most of the cases)
 *
 * In case of execution in the main thread, submitStage is provided by ShortPath
 * environment
 */
export type MainThreadAlgorithmCall =
    (graph: Graph, source: string, destination: string,
     submitStage: (stage: ExecutionStage) => void) => void;

export type GraphCheckResult = {
  message: string,
  markings: GraphChange[],
};

export type GraphCheck = (graph: Graph) => GraphCheckResult;

export type AttributeDescriptor = {
  name: string,
  defaultValue: number,
  visible: boolean,
  userModifiable: boolean,
}|{
  name: string,
  defaultValue: string,
  visible: boolean,
  userModifiable: false,
};

export type AlgorithmDescriptions = {
  general: string,
  history: string,
  pseudocode: string,
  references: string,
  attributesDefinitions?: GraphElementsAttributesDescriptions,
};

export type GraphElementsAttributesDescriptions = {
  nodes: {[key: string]: string},
  edges: {[key: string]: string},
};

export type AlgorithmDefinition = {
  descriptions: AlgorithmDescriptions,
  nodeProperties: AttributeDescriptor[],
  edgeProperties: AttributeDescriptor[],
  getWorker: () => Worker,
  mainThreadFunction: MainThreadAlgorithmCall,
  correctnessChecks: GraphCheck[],
  edgesLabel?: string,
};
