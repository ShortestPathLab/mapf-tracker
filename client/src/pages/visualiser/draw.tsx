import { Graphics } from "@pixi/react";
import { each, first, head, range, trim } from "lodash";
import memoizee from "memoizee";
import { Graphics as PixiGraphics } from "pixi.js";
import { LINE_WIDTH } from "./constants";

function hexToInt(s: string) {
  return parseInt(trim(s, "#"), 16);
}
export const $grid =
  ({ x: width, y: height }: { x: number; y: number }, color: string) =>
  (g: PixiGraphics) => {
    g.clear();
    g.lineStyle(LINE_WIDTH, hexToInt(color));
    for (const x of range(width + 1)) {
      g.moveTo(x, 0).lineTo(x, height);
    }
    for (const y of range(height + 1)) {
      g.moveTo(0, y).lineTo(width, y);
    }
  };
export const $box =
  ({ x: width, y: height }: { x: number; y: number }, color: string) =>
  (g: PixiGraphics) => {
    g.clear();
    g.lineStyle(LINE_WIDTH, hexToInt(color));
    g.moveTo(0, 0)
      .lineTo(0, height)
      .lineTo(width, height)
      .lineTo(width, 0)
      .lineTo(0, 0);
  };
export const $agents =
  (agents: { color: string; x: number; y: number }[]) => (g: PixiGraphics) => {
    g.clear();
    for (const { x, y, color } of agents) {
      g.beginFill(hexToInt(color))
        .drawCircle(x + 0.5, y + 0.5, 0.5)
        .endFill();
    }
  };
export const $map = (map: boolean[][], color: string) => (g: PixiGraphics) => {
  each(map, (row, y) => {
    each(row, (b, x) => {
      if (b) g.beginFill(hexToInt(color), 0.85).drawRect(x, y, 1, 1).endFill();
    });
  });
};
export const $agentDiagnostics = memoizee(
  (
      color: string,
      path: { x: number; y: number }[],
      goal: { x: number; y: number }
    ) =>
    (g: PixiGraphics) => {
      g.clear();
      g.lineStyle(LINE_WIDTH, hexToInt(color));
      g.moveTo(head(path).x + 0.5, head(path).y + 0.5);
      each(path, (point) => {
        g.lineTo(point.x + 0.5, point.y + 0.5);
      });
      g.drawCircle(first(path).x + 0.5, first(path).y + 0.5, 0.5);
      g.drawCircle(goal.x + 0.5, goal.y + 0.5, 0.5);
    },
  { normalizer: JSON.stringify }
);
export const $bg = memoizee(
  (color, width, height): ((graphics: PixiGraphics) => void) =>
    (g) =>
      g.beginFill(hexToInt(color)).drawRect(0, 0, width, height).endFill()
);
const $pointer = memoizee((color: string) => (g: PixiGraphics) => {
  return g
    .beginFill(hexToInt(color))
    .drawPolygon(-0.12, -0.7, 0.12, -0.7, 0, -0.8)
    .endFill();
});

export function Arrow({
  position,
  color,
  rotation,
  opacity,
}: {
  opacity: number;
  position: { x: number; y: number };
  color: string;
  rotation: number;
}) {
  return (
    <Graphics
      alpha={opacity}
      x={position.x + 0.5}
      y={position.y + 0.5}
      draw={$pointer(color)}
      rotation={rotation + Math.PI / 2}
    />
  );
}
export const getAngle = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => Math.atan2(b.y - a.y, b.x - a.x);
