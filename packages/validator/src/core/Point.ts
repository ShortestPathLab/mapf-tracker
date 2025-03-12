export type Point = { x: number; y: number };

export const serialisePoint = ({ x, y }: Point): string => `(${x}, ${y})`;

export const isEqual = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
