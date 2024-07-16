import { suite, it, expect } from "vitest";
import { DoneException, Reader, Seeker } from "index";

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
