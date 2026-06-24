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
 * Validate a group of agent solutions. See the module docs for the input shape.
 */
export function validate(input: any): any;
