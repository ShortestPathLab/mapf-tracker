import { Chunk } from '../core/Chunk.ts';

export interface Reader {
    read(): Chunk | undefined;
}
export declare class Reader {
    chunks: IterableIterator<RegExpExecArray>;
    offset: number;
    constructor(agent: string);
}
