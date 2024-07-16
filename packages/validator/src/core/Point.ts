import { Point } from "Point";

export type Point = { x: number; y: number };
export const serialisePoint = ({ x, y }: Point): string => `${x}.${y}`;
