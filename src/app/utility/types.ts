export type DisplayState = 'choose'|'addNode'|'addEdge'|'remove';

export type DisplayCommand = DisplayState|'generateRandom';

export interface ElementDescriptor {
  key: string;
  type: 'node'|'edge';
}

export type propertyDescriptor = {
  name: string, type: 'string', default: string;
}|{
  name: string, type: 'number', default: number;
};
