import {
  validate,
  checkImmediateCollision,
  checkDomainCollision,
  checkDomainOutOfBounds,
  checkEdgeCollision,
  checkGoalReached,
} from "../index";
import { expect, it, describe, mock, test } from "bun:test";

const size = 4000;

const T = true;
const _ = false;
const domain = {
  width: size,
  height: size,
  cells: Array(size)
    .fill(_)
    .map(() => new Array(size).fill(_).map(() => _)),
};

test("stress test", () => {
  const input = Array(size)
    .fill(undefined)
    .map(() => `${size - 1}d`);

  const onError = mock(() => true);

  validate({
    paths: input,
    domain,
    sources: Array(size)
      .fill(undefined)
      .map((a, i) => ({ x: i, y: 0 })),
    checks: [
      checkDomainOutOfBounds,
      checkImmediateCollision,
      checkDomainCollision,
      checkEdgeCollision,
    ],
    onError,
  });

  expect(onError).toBeCalledTimes(0);
});
