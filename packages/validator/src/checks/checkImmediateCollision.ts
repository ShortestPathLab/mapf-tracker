import { chain } from "lodash-es";
import { Point, serialisePoint as $ } from "core/Point";

export function checkImmediateCollision(
  prev: Point[],
  next: Point[],
  actions: string[],
  domain: string
) {
  const collision = chain(next)
    .countBy($)
    .values()
    .find((count) => count > 1)
    .value();
  return collision
    ? {
        errors: ["agent-to-agent collision"],
      }
    : {};
}
