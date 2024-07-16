import { suite, it, expect } from "vitest";
import { DoneException, Reader } from "index";

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
