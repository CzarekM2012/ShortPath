import Graph from 'graphology';

import {GraphChange} from '../graph-change/graph-change';

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
    this.changes.forEach((change) => {
      change.apply(graph);
    })
  }

  reverse(graph: Graph) {
    this.changes.forEach((change) => {
      change.reverse(graph);
    })
  }
}
