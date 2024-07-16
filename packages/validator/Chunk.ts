import { Item } from "linked-list";

export class Chunk extends Item {
  constructor(
    public count: number,
    public symbol: string,
    public offset: number
  ) {
    super();
  }
}
