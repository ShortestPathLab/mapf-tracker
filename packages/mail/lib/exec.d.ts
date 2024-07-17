export declare class ExecError extends Error {
}
type Param = string | number | boolean;
type Options = {
    params?: Param[];
    args?: {
        [K: string]: Param;
    };
    flags?: string[];
};
export declare function exec(path: string, { params, args, flags }?: Options, errorsAsOutput?: boolean): Promise<string>;
export {};
