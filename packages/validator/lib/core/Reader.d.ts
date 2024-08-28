import { Chunk } from '../core/Chunk';

export interface Reader {
    read(): Chunk | undefined;
}
export declare class Reader {
    chunks: Iterator<RegExpExecArray, [string, string, string]>;
    offset: number;
    constructor(agent: string);
}
