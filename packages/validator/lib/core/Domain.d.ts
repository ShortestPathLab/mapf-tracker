export type Domain = {
    width: number;
    height: number;
    /**
     * The contents of the domain, column then row.
     * Index via `cells[y][x]`.
     */
    cells: boolean[][];
};
