import { test, suite, it, expect, vitest } from "vitest";
import { DoneException, Reader, Seeker, validate } from "./validate";

test("Sanity", () => expect(1).toEqual(1));

suite("Reader", () => {
  it("should read a chunk correctly", () => {
    const input = "d3l";
    const reader = new Reader(input);
    {
      const chunk = reader.read();
      expect(chunk.count).toEqual(1);
      expect(chunk.symbol).toEqual("d");
    }
    {
      const chunk = reader.read();
      expect(chunk.count).toEqual(3);
      expect(chunk.symbol).toEqual("l");
    }
    {
      expect(() => reader.read()).toThrow(DoneException);
    }
  });
});

suite("Seeker", () => {
  it("should seek an element correctly", () => {
    // dlll
    const input = "d3l";
    const reader = new Reader(input);
    const seeker = new Seeker(reader);
    // Seek forwards
    expect(seeker.seek(0)).toEqual("d");
    expect(seeker.seek(1)).toEqual("l");
    expect(seeker.seek(2)).toEqual("l");
    expect(seeker.seek(3)).toEqual("l");
    // Seek backwards
    expect(seeker.seek(1)).toEqual("l");
    expect(seeker.seek(0)).toEqual("d");
    // Seek past end
    expect(() => seeker.seek(4)).toThrow(DoneException);
  });
});

suite("validate", () => {
  it("should validate a single agent without error", () => {
    const input = ["d3l"];

    const onError = vitest.fn(() => false);

    validate({
      paths: input,
      domain: "",
      sources: [{ x: 0, y: 0 }],
      checks: [],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(0);
  });
  it("should always error", () => {
    const input = ["d3l"];

    const onError = vitest.fn(() => true);

    validate({
      paths: input,
      domain: "",
      sources: [{ x: 0, y: 0 }],
      checks: [() => ({ errors: ["sample error"] })],
      onError: onError,
    });

    expect(onError).toBeCalledTimes(1);
  });
});
