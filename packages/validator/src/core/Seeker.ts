import { List } from "linked-list";
import { times } from "lodash-es";
import { LowerOutOfRangeException } from "../exceptions/LowerOutOfRangeException";
import { Chunk } from "./Chunk";
import { Reader } from "./Reader";

export class Seeker {
  cache = new List<Chunk>();
  current: Chunk;
  /**
   * @param reader
   * @param history How many previous chunks to store. Set to -1 to disable.
   */
  constructor(public reader: Reader, public history = 2) {
    this.current = reader.read();
    this.cache.append(this.current);
  }
  prune() {
    let c = this.current;
    times(
      this.history,
      () => this.current.prev && (c = this.current.prev as Chunk)
    );
    if (c.prev) c.prev = null;
  }
  seek(n: number): string {
    const status = checkRange(n, this.current);
    switch (status) {
      case "in-range": {
        // In the right chunk
        return this.current.symbol;
      }
      case "low": {
        // Decrement chunk
        if (this.current.prev) {
          this.current = this.current.prev as Chunk;
          return this.seek(n);
        } else {
          // Ran out of previous chunks
          throw new LowerOutOfRangeException();
        }
      }
      case "high": {
        // Increment chunk
        if (this.current.next) {
          // Navigate forward in cache
          // Considering pruning cache here
          if (this.history !== -1) this.prune();
          this.current = this.current.next as Chunk;
          return this.seek(n);
        } else {
          // Can throw DoneException
          this.cache.append(this.reader.read());
          return this.seek(n);
        }
      }
    }
  }
}

export function checkRange(n: number, chunk: Chunk) {
  const min = chunk.offset;
  const max = chunk.offset + chunk.count;
  return n < min ? "low" : min <= n && n < max ? "in-range" : "high";
}
