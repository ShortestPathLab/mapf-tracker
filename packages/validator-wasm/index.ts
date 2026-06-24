// Typed wrapper over the wasm-bindgen output in ./pkg.
// The generated bindings type `validate` as `(input: any) => any`; this module
// gives it a real signature and is the package's public entry point.
import {
  validate as wasmValidate,
  encode as wasmEncode,
  decode as wasmDecode,
} from "./pkg/validator_wasm.js";

export type Point = { x: number; y: number };

export type Domain = {
  width: number;
  height: number;
  /** Blocked cells, indexed `cells[y][x]`. */
  cells: boolean[][];
};

export type Check =
  | "immediateCollision"
  | "domainOutOfBounds"
  | "domainCollision"
  | "edgeCollision"
  | "goalReached";

export type ValidateInput = {
  /** Run-length encoded action string (u/d/l/r/w) per agent. */
  paths: string[];
  domain: Domain;
  sources: Point[];
  goals?: Point[];
  /** Checks to run, in order. Defaults to edge + immediate collision. */
  checks?: Check[];
  /** Stop at the first failing check. Defaults to `true`. */
  stopOnFirstError?: boolean;
};

export type CheckError = {
  errors: string[];
  errorAgents: number[];
  errorTimesteps: number[];
};

export type ValidateOutput = {
  /** One entry per failing check, in the order encountered. */
  errors: CheckError[];
  /** Total solution cost: the summed length of every decoded path. */
  cost: number;
};

/** Validate a group of agent solutions. Throws on malformed input. */
export function validate(input: ValidateInput): ValidateOutput {
  return wasmValidate(input) as ValidateOutput;
}

/** Run-length encode an action string (`dlll` -> `d3l`). */
export function encode(input: string): string {
  return wasmEncode(input);
}

/** Run-length decode an action string (`d3l` -> `dlll`). */
export function decode(input: string): string {
  return wasmDecode(input);
}
