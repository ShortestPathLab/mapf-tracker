//! The validation driver.
//!
//! Ports `validator/src/validate.ts`. The agents are stepped through their
//! decoded action strings one timestep at a time. At each timestep checks run
//! in three stages — `pre` (before the occupancy grid is updated), `post`
//! (after), and `final` (once every agent has finished) — exactly as the
//! original double-buffered loop did.

use serde::{Deserialize, Serialize};

use crate::checks::{self, CheckError, Grid};
use crate::geometry::{Domain, Point};
use crate::rle;

/// Which checks to run, and in what order. The ordering matters: with
/// `stop_on_first_error` set, the first failing check wins.
#[derive(Deserialize, Clone, Copy, PartialEq, Eq)]
pub enum Check {
    ImmediateCollision,
    DomainOutOfBounds,
    DomainCollision,
    EdgeCollision,
    GoalReached,
}

enum Stage {
    Pre,
    Post,
    Final,
}

impl Check {
    fn stage(self) -> Stage {
        match self {
            Check::EdgeCollision => Stage::Pre,
            Check::ImmediateCollision | Check::DomainOutOfBounds | Check::DomainCollision => {
                Stage::Post
            }
            Check::GoalReached => Stage::Final,
        }
    }

    /// Accepts both the short name (`edgeCollision`) and the original function
    /// name (`checkEdgeCollision`).
    pub fn from_name(name: &str) -> Option<Check> {
        let name = name.strip_prefix("check").map(lower_first).unwrap_or_else(|| name.to_string());
        match name.as_str() {
            "immediateCollision" => Some(Check::ImmediateCollision),
            "domainOutOfBounds" => Some(Check::DomainOutOfBounds),
            "domainCollision" => Some(Check::DomainCollision),
            "edgeCollision" => Some(Check::EdgeCollision),
            "goalReached" => Some(Check::GoalReached),
            _ => None,
        }
    }
}

fn lower_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        Some(c) => c.to_lowercase().collect::<String>() + chars.as_str(),
        None => String::new(),
    }
}

fn default_checks() -> Vec<Check> {
    vec![Check::EdgeCollision, Check::ImmediateCollision]
}

fn default_true() -> bool {
    true
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidateInput {
    /// Run-length encoded action string per agent.
    pub paths: Vec<String>,
    pub domain: Domain,
    pub sources: Vec<Point>,
    #[serde(default)]
    pub goals: Vec<Point>,
    /// Checks to run, in order. Accepts an array of names; see [`Check::from_name`].
    #[serde(default, deserialize_with = "deserialize_checks")]
    pub checks: Option<Vec<Check>>,
    /// Stop at the first failing check (the behaviour the validation worker
    /// relies on). When `false`, collects every error instead.
    #[serde(default = "default_true")]
    pub stop_on_first_error: bool,
}

/// Accept check names as strings and resolve them to the `Check` enum, erroring
/// on unknown names rather than silently dropping them.
fn deserialize_checks<'de, D>(deserializer: D) -> Result<Option<Vec<Check>>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error;
    let names: Option<Vec<String>> = Option::deserialize(deserializer)?;
    match names {
        None => Ok(None),
        Some(names) => names
            .iter()
            .map(|n| Check::from_name(n).ok_or_else(|| D::Error::custom(format!("unknown check: {n}"))))
            .collect::<Result<Vec<_>, _>>()
            .map(Some),
    }
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ValidateOutput {
    /// One entry per failing check, in the order encountered.
    pub errors: Vec<CheckError>,
    /// Total solution cost: the summed length of every decoded path.
    pub cost: usize,
}

/// Run validation. Pure (no wasm/JS dependency) so it can be unit-tested natively.
pub fn run(input: &ValidateInput) -> ValidateOutput {
    let ValidateInput {
        paths,
        domain,
        sources,
        goals,
        stop_on_first_error,
        ..
    } = input;
    let checks = input.checks.clone().unwrap_or_else(default_checks);

    let all_paths: Vec<Vec<u8>> = paths.iter().map(|p| rle::decode(p).into_bytes()).collect();
    let cost = all_paths.iter().map(Vec::len).sum();
    let timespan = all_paths.iter().map(Vec::len).max();

    let n = sources.len();
    let (width, height) = (domain.width, domain.height);

    let mut prev: Vec<Point> = sources.clone();
    let mut next: Vec<Point> = sources.clone();

    // Occupancy grid, seeded with every agent's source position.
    let mut grid: Grid = vec![vec![Vec::new(); width.max(0) as usize]; height.max(0) as usize];
    for (a, p) in next.iter().enumerate() {
        grid_add(&mut grid, p, a, width, height);
    }

    let mut errors: Vec<CheckError> = Vec::new();
    let mut stopped = false;

    // Macro-free helper: run a check, recording its error and honouring stop mode.
    let record = |errors: &mut Vec<CheckError>, result: Option<CheckError>| -> bool {
        if let Some(error) = result {
            errors.push(error);
            return *stop_on_first_error;
        }
        false
    };

    let mut i: usize = 0;
    if let Some(timespan) = timespan {
        while i <= timespan {
            // Advance every agent by this timestep's action.
            for a in 0..n {
                let action = all_paths[a].get(i).copied();
                let (dx, dy) = offset(action);
                next[a] = Point {
                    x: prev[a].x + dx,
                    y: prev[a].y + dy,
                };
            }

            // --- pre stage (grid still reflects `prev`) ---
            for &check in &checks {
                if matches!(check.stage(), Stage::Pre) {
                    let result = run_timestep_check(
                        check, &prev, &next, &grid, &all_paths, domain, i + 1, width, height,
                    );
                    if record(&mut errors, result) {
                        stopped = true;
                        break;
                    }
                }
            }
            if stopped {
                break;
            }

            // Move agents on the grid: out of `prev`, into `next`.
            for a in 0..n {
                grid_remove(&mut grid, &prev[a], a, width, height);
                grid_add(&mut grid, &next[a], a, width, height);
            }

            // --- post stage (grid now reflects `next`) ---
            for &check in &checks {
                if matches!(check.stage(), Stage::Post) {
                    let result = run_timestep_check(
                        check, &prev, &next, &grid, &all_paths, domain, i + 1, width, height,
                    );
                    if record(&mut errors, result) {
                        stopped = true;
                        break;
                    }
                }
            }
            if stopped {
                break;
            }

            std::mem::swap(&mut prev, &mut next);
            i += 1;
        }
    }

    // --- final stage ---
    if !stopped {
        for &check in &checks {
            if matches!(check.stage(), Stage::Final) {
                let result = match check {
                    Check::GoalReached => checks::goal_reached(&prev, goals, i),
                    _ => None,
                };
                if record(&mut errors, result) {
                    break;
                }
            }
        }
    }

    ValidateOutput { errors, cost }
}

#[allow(clippy::too_many_arguments)]
fn run_timestep_check(
    check: Check,
    prev: &[Point],
    next: &[Point],
    grid: &Grid,
    paths: &[Vec<u8>],
    domain: &Domain,
    timestep: usize,
    width: i32,
    height: i32,
) -> Option<CheckError> {
    match check {
        Check::EdgeCollision => {
            checks::edge_collision(prev, next, grid, paths, timestep, width, height)
        }
        Check::ImmediateCollision => {
            checks::immediate_collision(prev, grid, timestep, width, height)
        }
        Check::DomainOutOfBounds => checks::domain_out_of_bounds(prev, domain, timestep),
        Check::DomainCollision => checks::domain_collision(prev, domain, timestep),
        Check::GoalReached => None,
    }
}

/// Action -> grid offset. Anything that isn't `u/d/l/r` (including `w` and the
/// end of a path) is a wait.
fn offset(action: Option<u8>) -> (i32, i32) {
    match action {
        Some(b'u') => (0, -1),
        Some(b'd') => (0, 1),
        Some(b'l') => (-1, 0),
        Some(b'r') => (1, 0),
        _ => (0, 0),
    }
}

fn in_bounds(p: &Point, width: i32, height: i32) -> bool {
    0 <= p.x && p.x < width && 0 <= p.y && p.y < height
}

fn grid_add(grid: &mut Grid, p: &Point, agent: usize, width: i32, height: i32) {
    if in_bounds(p, width, height) {
        let cell = &mut grid[p.y as usize][p.x as usize];
        if !cell.contains(&agent) {
            cell.push(agent);
        }
    }
}

fn grid_remove(grid: &mut Grid, p: &Point, agent: usize, width: i32, height: i32) {
    if in_bounds(p, width, height) {
        grid[p.y as usize][p.x as usize].retain(|&a| a != agent);
    }
}
