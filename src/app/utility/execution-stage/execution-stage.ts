import Graph from 'graphology';

import {GraphChange} from '../graph-change/graph-change';
import {ElementDescriptor} from '../types';

export class ExecutionStage {
  changes: GraphChange[] = [];
  description: string = '';
  constructor() {}

  addChange(change: GraphChange) {
    const indexToReplace = this.changes.findIndex((member) => {
      GraphChange.areRedundant(member, change);
    });
    if (indexToReplace != -1) {
      this.changes[indexToReplace] = change;
      return;
    } else
      this.changes.push(change);
  }

  apply(graph: Graph) {
    const changed: {element: ElementDescriptor, attribute: string}[] = [];
    this.changes.forEach((change) => {
      change.apply(graph);
      changed.push({element: change.element, attribute: change.property});
    });
    return changed;
  }

  reverse(graph: Graph) {
    const changed: {element: ElementDescriptor, attribute: string}[] = [];
    this.changes.forEach((change) => {
      change.reverse(graph);
      changed.push({element: change.element, attribute: change.property});
    });
    return changed;
  }
}
