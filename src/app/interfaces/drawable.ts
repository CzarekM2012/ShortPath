export interface Drawable {
  color: string;
  draw(): void;
  distSq(): number;
}
