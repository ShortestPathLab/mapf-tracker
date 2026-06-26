/* tslint:disable */
/* eslint-disable */

/**
 * Run-length decode an action string (`d3l` -> `dlll`).
 */
export function decode(input: string): string;

/**
 * Run-length encode an action string (`dlll` -> `d3l`).
 */
export function encode(input: string): string;

/**
 * Length of a (potentially run-length encoded) action string once decoded.
 */
export function length(solution_path: string): number;

/**
 * Makespan of a solution: the longest decoded path length across all agents.
 */
export function makespan(solution: string[]): number;

/**
 * Validate a group of agent solutions. See the module docs for the input shape.
 */
export function validate(input: any): any;
