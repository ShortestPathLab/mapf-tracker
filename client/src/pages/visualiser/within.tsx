import { Rectangle } from "pixi.js";

export function within({ x, y }: { x: number; y: number }, bounds?: Rectangle) {
  if (bounds) {
    return (
      bounds.left < x + 2 &&
      bounds.right > x - 2 &&
      bounds.top < y + 2 &&
      bounds.bottom > y - 2
    );
  }
  return true;
}
