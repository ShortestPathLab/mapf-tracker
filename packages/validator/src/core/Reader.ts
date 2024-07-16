import { Chunk } from "core/Chunk";
import { DoneException } from "exceptions/DoneException";

export interface Reader {
  read(): Chunk | undefined;
}

export class Reader {
  chunks: IterableIterator<RegExpExecArray>;
  offset = 0;
  constructor(agent: string) {
    this.chunks = agent.matchAll(/(\d*)([a-z])/g);
  }
  read() {
    const { value, done } = this.chunks.next();
    if (!done) {
      const [_, count, symbol] = value;
      const o = count ? +count : 1;
      const out = new Chunk(o, symbol, this.offset);
      this.offset += o;
      return out;
    } else {
      throw new DoneException();
    }
  }
}
