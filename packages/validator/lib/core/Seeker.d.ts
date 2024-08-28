import { List } from 'linked-list';
import { Chunk } from './Chunk';
import { Reader } from './Reader';

export declare class Seeker {
    reader: Reader;
    history: number;
    cache: List<Chunk>;
    current: Chunk;
    /**
     * @param reader
     * @param history How many previous chunks to store. Set to -1 to disable.
     */
    constructor(reader: Reader, history?: number);
    prune(): void;
    seek(n: number): string;
}
export declare function checkRange(n: number, chunk: Chunk): "low" | "in-range" | "high";
