import { List } from 'linked-list';
import { Chunk } from './Chunk.ts';
import { Reader } from './Reader.ts';

export declare class Seeker {
    reader: Reader;
    history: number;
    cache: List<Chunk>;
    current: Chunk;
    /**
     * @param reader
     * @param history How many previous chunks to store.
     */
    constructor(reader: Reader, history?: number);
    prune(): void;
    seek(n: number): string;
}
export declare function checkRange(n: number, chunk: Chunk): "low" | "in-range" | "high";
