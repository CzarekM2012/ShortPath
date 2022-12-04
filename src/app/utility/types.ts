export type DisplayState = 'choose'|'addNode'|'addEdge'|'remove';

export interface ElementDescriptor {
  key: string;
  type: 'node'|'edge';
}

export type AttributeDescriptor = {
  name: string, default: string|number;
}
