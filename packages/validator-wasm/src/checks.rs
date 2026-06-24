//! The individual validation checks.
//!
//! Ports the five checks in `validator/src/checks/`. Each function returns
//! `Some(CheckError)` when it finds a violation (mirroring the first match that
//! the TypeScript `findIndex`/`find` returns) and `None` otherwise.

use serde::Serialize;

use crate::geometry::{Domain, Point};

/// An occupancy grid. `grid[y][x]` holds the agent ids currently in that cell,
/// in insertion order (matching JavaScript `Set` iteration order, which the
/// edge-collision check depends on for its "first" element).
pub type Grid = Vec<Vec<Vec<usize>>>;

/// The result of a single failing check — the Rust equivalent of `CheckResult`.
#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CheckError {
    pub errors: Vec<String>,
    pub error_agents: Vec<usize>,
    pub error_timesteps: Vec<usize>,
}

/// The grid cell at `(x, y)`, or `None` when out of bounds.
fn cell<'a>(grid: &'a Grid, p: &Point, width: i32, height: i32) -> Option<&'a Vec<usize>> {
    if 0 <= p.x && p.x < width && 0 <= p.y && p.y < height {
        Some(&grid[p.y as usize][p.x as usize])
    } else {
        None
    }
}

/// Comma-joined agent ids, e.g. `0,1` — matches JS `Array.toString()`.
fn join(agents: &[usize]) -> String {
    agents
        .iter()
        .map(|a| a.to_string())
        .collect::<Vec<_>>()
        .join(",")
}

/// `checkEdgeCollision` (pre stage). Detects two agents swapping places across
/// a shared edge. `paths` are the decoded (expanded) action strings.
pub fn edge_collision(
    prev: &[Point],
    next: &[Point],
    grid: &Grid,
    paths: &[Vec<u8>],
    timestep: usize,
    width: i32,
    height: i32,
) -> Option<CheckError> {
    for (agent, next_position) in next.iter().enumerate() {
        let target = cell(grid, next_position, width, height);
        let action = paths.get(agent).and_then(|p| p.get(timestep - 1)).copied();

        // The tile must have actually been moved into (not a wait) and have been
        // previously occupied.
        let moved = matches!(action, Some(a) if a != b'w');
        let occupied = matches!(target, Some(t) if !t.is_empty());
        if !(moved && occupied) {
            continue;
        }

        let first = target.unwrap()[0];
        // Edge collision: the agent that held our target tile is moving into the
        // tile we are vacating.
        if next[first] == prev[agent] {
            let other = cell(grid, &next[agent], width, height)
                .cloned()
                .unwrap_or_default();
            let mut error_agents = vec![agent];
            error_agents.extend(other.iter().copied());
            return Some(CheckError {
                errors: vec![format!(
                    "agent-to-agent edge collision, agent {}, at timestep {}, at {}, with agent {}",
                    agent,
                    timestep,
                    next[agent].serialise(),
                    join(&other),
                )],
                error_agents,
                error_timesteps: vec![timestep],
            });
        }
    }
    None
}

/// `checkImmediateCollision` (post stage). Two agents occupying the same cell.
pub fn immediate_collision(
    prev: &[Point],
    grid: &Grid,
    timestep: usize,
    width: i32,
    height: i32,
) -> Option<CheckError> {
    for (agent, p) in prev.iter().enumerate() {
        let occupants = cell(grid, p, width, height);
        if matches!(occupants, Some(c) if c.len() > 1) {
            let collision = occupants.unwrap();
            return Some(CheckError {
                errors: vec![format!(
                    "agent-to-agent direct collision, agents {} and {}, at timestep {}",
                    agent,
                    join(collision),
                    timestep,
                )],
                error_agents: vec![agent],
                error_timesteps: vec![timestep],
            });
        }
    }
    None
}

/// `checkDomainOutOfBounds` (post stage).
pub fn domain_out_of_bounds(
    prev: &[Point],
    domain: &Domain,
    timestep: usize,
) -> Option<CheckError> {
    for (agent, p) in prev.iter().enumerate() {
        if !domain.contains(p) {
            return Some(CheckError {
                errors: vec![format!(
                    "agent {} out of bounds, at timestep {}, {}",
                    agent,
                    timestep,
                    p.serialise(),
                )],
                error_agents: vec![agent],
                error_timesteps: vec![timestep],
            });
        }
    }
    None
}

/// `checkDomainCollision` (post stage). An agent standing on a blocked cell.
pub fn domain_collision(prev: &[Point], domain: &Domain, timestep: usize) -> Option<CheckError> {
    for (agent, p) in prev.iter().enumerate() {
        if domain.is_blocked(p) {
            return Some(CheckError {
                errors: vec![format!(
                    "agent {} collision with environment, at timestep {}, {}",
                    agent,
                    timestep,
                    p.serialise(),
                )],
                error_agents: vec![agent],
                error_timesteps: vec![timestep],
            });
        }
    }
    None
}

/// `checkGoalReached` (final stage). Every agent must end on its goal.
pub fn goal_reached(current: &[Point], goals: &[Point], timestep: usize) -> Option<CheckError> {
    for i in 0..current.len().max(goals.len()) {
        let p1 = current.get(i);
        let p2 = goals.get(i);
        let reached = matches!((p1, p2), (Some(a), Some(b)) if a == b);
        if !reached {
            let expected = p2.map(Point::serialise).unwrap_or_else(|| "?".into());
            let got = p1.map(Point::serialise).unwrap_or_else(|| "?".into());
            return Some(CheckError {
                errors: vec![format!(
                    "agent {} did not reach goal. Expected {}, got {}",
                    i, expected, got,
                )],
                error_agents: vec![i],
                error_timesteps: vec![timestep],
            });
        }
    }
    None
}
