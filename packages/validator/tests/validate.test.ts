import {
  checkImmediateCollision,
  validate,
  checkDomainCollision,
  checkDomainOutOfBounds,
  checkEdgeCollision,
  checkGoalReached,
} from "../index";
import { expect, it, describe, mock } from "bun:test";

const T = true;
const _ = false;
const domain = {
  width: 2,
  height: 2,
  cells: [
    [T, _],
    [_, _],
  ],
};

describe("validate (simple)", () => {
  it("should validate a single agent without any checks", () => {
    const input = ["d2r"];

    const onError = mock(() => false);

    validate({
      paths: input,
      domain,
      sources: [{ x: 0, y: 0 }],
      checks: [],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(0);
  });
  it("should error given a mock always-error check", () => {
    const input = ["d3l"];

    const onError = mock(() => true);

    validate({
      paths: input,
      domain,
      sources: [{ x: 0, y: 0 }],
      checks: [() => ({ errors: ["sample error"] })],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(1);
  });
});

describe("validate (collisions)", () => {
  it("should detect simple collision", () => {
    const onError = mock(() => true);

    validate({
      paths: ["u", "r"],
      domain,
      sources: [
        { x: 1, y: 1 },
        { x: 0, y: 0 },
      ],
      checks: [checkImmediateCollision],
      onError: onError,
    });

    expect(onError).toBeCalled();
  });
  it("should not error on valid paths (direct collision)", () => {
    const onError = mock(() => true);

    validate({
      paths: ["u", "u"],
      domain,
      sources: [
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      checks: [checkImmediateCollision],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(0);
  });
  it("should detect edge collision", () => {
    const onError = mock(() => true);

    validate({
      paths: ["u", "d"],
      domain,
      sources: [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ],
      checks: [checkEdgeCollision],
      onError,
    });

    expect(onError).toBeCalled();
  });
  it("should not error on valid paths - edge collision", () => {
    const onError = mock(() => true);

    validate({
      paths: ["u", "u"],
      domain,
      sources: [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ],
      checks: [checkEdgeCollision],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(0);
  });
});

describe("validate (domain)", () => {
  it("should detect domain collision", () => {
    const onError = mock(() => true);
    validate({
      paths: ["u"],
      domain,
      sources: [{ x: 0, y: 1 }],
      checks: [checkDomainCollision],
      onError: onError,
    });
    expect(onError).toBeCalled();
  });
  it("should not error on non-collision", () => {
    const onError = mock(() => true);
    validate({
      paths: ["u"],
      domain,
      sources: [{ x: 1, y: 1 }],
      checks: [checkDomainCollision],
      onError: onError,
    });
    expect(onError).toBeCalledTimes(0);
  });
  it("should detect out of bounds", () => {
    const onError = mock(() => true);
    validate({
      paths: ["2u"],
      domain,
      sources: [{ x: 0, y: 1 }],
      checks: [checkDomainOutOfBounds],
      onError: onError,
    });
    expect(onError).toBeCalled();
  });
  it("should not error on non-collision", () => {
    const onError = mock(() => true);
    validate({
      paths: ["u"],
      domain,
      sources: [{ x: 1, y: 1 }],
      checks: [checkDomainOutOfBounds],
      onError: onError,
    });
    expect(onError).toBeCalledTimes(0);
  });
});

describe("validate (goal)", () => {
  it("should error on goal not reached", () => {
    const onError = mock(() => true);
    validate({
      paths: ["2r"],
      domain,
      sources: [{ x: 0, y: 0 }],
      goals: [{ x: 1, y: 1 }],
      checks: [checkGoalReached],
      onError,
    });
    expect(onError).toBeCalled();
  });
  it("should not error on goal reached", () => {
    const onError = mock(() => true);
    validate({
      paths: ["rd"],
      domain,
      sources: [{ x: 0, y: 0 }],
      goals: [{ x: 1, y: 1 }],
      checks: [checkGoalReached],
      onError,
    });
    expect(onError).toBeCalledTimes(0);
  });
});
