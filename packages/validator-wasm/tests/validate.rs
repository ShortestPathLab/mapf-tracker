//! Native port of `validator/tests/validate.test.ts`. Run with `cargo test`.

use validator_wasm::{run, ValidateInput};

/// The 2x2 domain used throughout the original test suite. `(0, 0)` is blocked.
fn domain_json() -> serde_json::Value {
    serde_json::json!({
        "width": 2,
        "height": 2,
        "cells": [[true, false], [false, false]],
    })
}

fn validate(value: serde_json::Value) -> usize {
    let input: ValidateInput = serde_json::from_value(value).expect("valid input");
    run(&input).errors.len()
}

fn case(
    paths: &[&str],
    sources: serde_json::Value,
    goals: serde_json::Value,
    checks: &[&str],
) -> serde_json::Value {
    serde_json::json!({
        "paths": paths,
        "domain": domain_json(),
        "sources": sources,
        "goals": goals,
        "checks": checks,
    })
}

#[test]
fn no_checks_never_errors() {
    let errors = validate(case(
        &["d2r"],
        serde_json::json!([{ "x": 0, "y": 0 }]),
        serde_json::json!([]),
        &[],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn detects_immediate_collision() {
    let errors = validate(case(
        &["u", "r"],
        serde_json::json!([{ "x": 1, "y": 1 }, { "x": 0, "y": 0 }]),
        serde_json::json!([]),
        &["immediateCollision"],
    ));
    assert!(errors > 0);
}

#[test]
fn allows_valid_paths_immediate() {
    let errors = validate(case(
        &["u", "u"],
        serde_json::json!([{ "x": 1, "y": 1 }, { "x": 0, "y": 1 }]),
        serde_json::json!([]),
        &["immediateCollision"],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn detects_edge_collision() {
    let errors = validate(case(
        &["u", "d"],
        serde_json::json!([{ "x": 0, "y": 1 }, { "x": 0, "y": 0 }]),
        serde_json::json!([]),
        &["edgeCollision"],
    ));
    assert!(errors > 0);
}

#[test]
fn allows_valid_paths_edge() {
    let errors = validate(case(
        &["u", "u"],
        serde_json::json!([{ "x": 0, "y": 1 }, { "x": 0, "y": 0 }]),
        serde_json::json!([]),
        &["edgeCollision"],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn detects_domain_collision() {
    let errors = validate(case(
        &["u"],
        serde_json::json!([{ "x": 0, "y": 1 }]),
        serde_json::json!([]),
        &["domainCollision"],
    ));
    assert!(errors > 0);
}

#[test]
fn allows_non_domain_collision() {
    let errors = validate(case(
        &["u"],
        serde_json::json!([{ "x": 1, "y": 1 }]),
        serde_json::json!([]),
        &["domainCollision"],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn detects_out_of_bounds() {
    let errors = validate(case(
        &["2u"],
        serde_json::json!([{ "x": 0, "y": 1 }]),
        serde_json::json!([]),
        &["domainOutOfBounds"],
    ));
    assert!(errors > 0);
}

#[test]
fn allows_in_bounds() {
    let errors = validate(case(
        &["u"],
        serde_json::json!([{ "x": 1, "y": 1 }]),
        serde_json::json!([]),
        &["domainOutOfBounds"],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn errors_on_goal_not_reached() {
    let errors = validate(case(
        &["2r"],
        serde_json::json!([{ "x": 0, "y": 0 }]),
        serde_json::json!([{ "x": 1, "y": 1 }]),
        &["goalReached"],
    ));
    assert!(errors > 0);
}

#[test]
fn allows_goal_reached() {
    let errors = validate(case(
        &["rd"],
        serde_json::json!([{ "x": 0, "y": 0 }]),
        serde_json::json!([{ "x": 1, "y": 1 }]),
        &["goalReached"],
    ));
    assert_eq!(errors, 0);
}

#[test]
fn reports_cost_as_summed_path_lengths() {
    let input: ValidateInput = serde_json::from_value(case(
        &["d2r", "rd"],
        serde_json::json!([{ "x": 0, "y": 0 }, { "x": 0, "y": 0 }]),
        serde_json::json!([]),
        &[],
    ))
    .unwrap();
    // "d2r" -> "drr" (3), "rd" -> "rd" (2)
    assert_eq!(run(&input).cost, 5);
}

#[test]
fn stress_many_agents_in_a_row() {
    let size = 500;
    let cells: Vec<Vec<bool>> = vec![vec![false; size]; size];
    let paths: Vec<String> = (0..size).map(|_| format!("{}d", size - 1)).collect();
    let sources: Vec<serde_json::Value> =
        (0..size).map(|i| serde_json::json!({ "x": i, "y": 0 })).collect();

    let input: ValidateInput = serde_json::from_value(serde_json::json!({
        "paths": paths,
        "domain": { "width": size, "height": size, "cells": cells },
        "sources": sources,
        "goals": [],
        "checks": ["domainOutOfBounds", "immediateCollision", "domainCollision", "edgeCollision"],
    }))
    .unwrap();

    assert_eq!(run(&input).errors.len(), 0);
}
