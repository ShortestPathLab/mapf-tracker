//! MAPF solution validator — Rust/WebAssembly rewrite of the `validator` package.
//!
//! The wasm surface is intentionally small: a single [`validate`] entry point
//! plus the run-length [`encode`]/[`decode`] helpers. The pluggable
//! check-callback architecture of the original is replaced by a `checks` list
//! passed in the input, because invoking JS callbacks across the wasm boundary
//! per timestep would defeat the point of the rewrite.
//!
//! ## `validate(input)`
//!
//! ```js
//! import { validate } from "validator-wasm";
//!
//! const { errors, cost } = validate({
//!   paths: ["d2r"],
//!   domain: { width: 2, height: 2, cells: [[true, false], [false, false]] },
//!   sources: [{ x: 0, y: 0 }],
//!   goals: [{ x: 1, y: 1 }],
//!   checks: ["immediateCollision", "domainOutOfBounds", "domainCollision",
//!            "edgeCollision", "goalReached"],
//!   // stopOnFirstError defaults to true
//! });
//! ```
//!
//! `errors` is an array of `{ errors: string[], errorAgents: number[],
//! errorTimesteps: number[] }`, and `cost` is the summed length of every
//! decoded path.

mod checks;
mod engine;
mod geometry;
mod rle;

pub use engine::{run, ValidateInput, ValidateOutput};

use wasm_bindgen::prelude::*;

/// Validate a group of agent solutions. See the module docs for the input shape.
#[wasm_bindgen]
pub fn validate(input: JsValue) -> Result<JsValue, JsValue> {
    let input: ValidateInput =
        serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let output = engine::run(&input);
    serde_wasm_bindgen::to_value(&output).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Run-length encode an action string (`dlll` -> `d3l`).
#[wasm_bindgen]
pub fn encode(input: &str) -> String {
    rle::encode(input)
}

/// Run-length decode an action string (`d3l` -> `dlll`).
#[wasm_bindgen]
pub fn decode(input: &str) -> String {
    rle::decode(input)
}
