export type DisplayState = 'choose'|'addNode'|'addEdge'|'remove';

export type DisplayCommand = DisplayState|'generateRandom';

export interface ElementDescriptor {
  key: string;
  type: 'node'|'edge';
}
