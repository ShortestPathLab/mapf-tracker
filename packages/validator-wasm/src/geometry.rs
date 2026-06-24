//! Points and the domain (the grid map).
//!
//! Ports `validator/src/core/Point.ts` and `core/Domain.ts`. Coordinates are
//! signed so that out-of-bounds positions (negative or past the edge) are
//! representable — the out-of-bounds check relies on that.

use serde::Deserialize;

#[derive(Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

impl Point {
    /// `(x, y)` — matches `serialisePoint` in the TypeScript source.
    pub fn serialise(&self) -> String {
        format!("({}, {})", self.x, self.y)
    }
}

#[derive(Deserialize)]
pub struct Domain {
    pub width: i32,
    pub height: i32,
    /// Blocked cells, indexed `cells[y][x]`.
    pub cells: Vec<Vec<bool>>,
}

impl Domain {
    pub fn contains(&self, p: &Point) -> bool {
        0 <= p.x && p.x < self.width && 0 <= p.y && p.y < self.height
    }

    /// `true` if the cell at `p` is blocked. Out-of-bounds is treated as not
    /// blocked (the dedicated out-of-bounds check is responsible for that case).
    pub fn is_blocked(&self, p: &Point) -> bool {
        self.contains(p) && self.cells[p.y as usize][p.x as usize]
    }
}
