import { Item } from 'linked-list';

export declare class Chunk extends Item {
    count: number;
    symbol: string;
    offset: number;
    constructor(count: number, symbol: string, offset: number);
}
