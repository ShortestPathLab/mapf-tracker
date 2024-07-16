import { checkDomainCollision } from "checks/checkDomainCollision";
import { checkDomainOutOfBounds } from "checks/checkDomainOutOfBounds";
import { checkEdgeCollision } from "checks/checkEdgeCollision";
import { checkGoalReached } from "checks/checkGoalReached";
import { checkImmediateCollision, validate } from "index";
import { expect, it, suite, vitest } from "vitest";

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

suite("validate (simple)", () => {
  it("should validate a single agent without any checks", () => {
    const input = ["d3l"];

    const onError = vitest.fn(() => false);

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

    const onError = vitest.fn(() => true);

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

suite("validate (collisions)", () => {
  it("should detect simple collision", () => {
    const onError = vitest.fn(() => true);

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
    const onError = vitest.fn(() => true);

    validate({
      paths: ["u", "u"],
      domain,
      sources: [
        { x: 1, y: 1 },
        { x: 0, y: 0 },
      ],
      checks: [checkImmediateCollision],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(0);
  });
  it("should detect edge collision", () => {
    const onError = vitest.fn(() => true);

    validate({
      paths: ["u", "r"],
      domain,
      sources: [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
      ],
      checks: [checkEdgeCollision],
      onError: onError,
    });

    expect(onError).toBeCalled();
  });
  it("should not error on valid paths (edge collision)", () => {
    const onError = vitest.fn(() => true);

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

suite("validate (domain)", () => {
  it("should detect domain collision", () => {
    const onError = vitest.fn(() => true);
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
    const onError = vitest.fn(() => true);
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
    const onError = vitest.fn(() => true);
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
    const onError = vitest.fn(() => true);
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

suite("validate (goal)", () => {
  it("should error on goal not reached", () => {
    const onError = vitest.fn(() => true);
    validate({
      paths: ["2r"],
      domain,
      sources: [{ x: 0, y: 0 }],
      goals: [{ x: 1, y: 1 }],
      checks: [],
      finalChecks: [checkGoalReached],
      onError,
    });
    expect(onError).toBeCalled();
  });
  it("should not error on goal reached", () => {
    const onError = vitest.fn(() => true);
    validate({
      paths: ["rd"],
      domain,
      sources: [{ x: 0, y: 0 }],
      goals: [{ x: 1, y: 1 }],
      checks: [],
      finalChecks: [checkGoalReached],
      onError,
    });
    expect(onError).toBeCalledTimes(0);
  });
});
