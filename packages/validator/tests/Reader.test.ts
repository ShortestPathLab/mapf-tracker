import { describe, it, expect } from "bun:test";
import { DoneException, Reader } from "../index";

describe("Reader", () => {
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
