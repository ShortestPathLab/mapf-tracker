//! Run-length encoder/decoder.
//!
//! Faithful port of `validator/src/encode.ts`. The MAPF solution format stores
//! agent action strings run-length encoded, e.g. `d3l` expands to `dlll`.

/// Run-length encode a string.
///
/// Mirrors the (slightly idiosyncratic) behaviour of the TypeScript original,
/// including its handling of already-numeric runs.
pub fn encode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut encoded = String::new();
    let mut i = 0;

    while i < bytes.len() {
        let current = bytes[i];

        // Pass through any numbers verbatim, then the symbol that follows them.
        if current.is_ascii_digit() {
            while i < bytes.len() && bytes[i].is_ascii_digit() {
                encoded.push(bytes[i] as char);
                i += 1;
            }
            if i < bytes.len() {
                encoded.push(bytes[i] as char);
                i += 1;
            }
            continue;
        }

        // Count consecutive occurrences of the current symbol.
        let mut count = 0;
        while i < bytes.len() && bytes[i] == current {
            count += 1;
            i += 1;
        }
        if count > 1 {
            encoded.push_str(&count.to_string());
        }
        encoded.push(current as char);
    }

    encoded
}

/// Run-length decode a string. `d3l` -> `dlll`.
///
/// A count of `0` (or an absent count) decodes to a single repetition, matching
/// the original `char.repeat(Number(count) || 1)` semantics.
pub fn decode(encoded: &str) -> String {
    let mut decoded = String::new();
    let mut count = String::new();

    for ch in encoded.chars() {
        if ch.is_ascii_digit() {
            count.push(ch);
        } else {
            let n = match count.parse::<usize>() {
                Ok(n) if n > 0 => n,
                _ => 1,
            };
            for _ in 0..n {
                decoded.push(ch);
            }
            count.clear();
        }
    }

    decoded
}

/// Length of the decoded action string, without allocating the decoded form.
///
/// Mirrors [`decode`]'s semantics: digits accumulate a run count that applies to
/// the following symbol (`d3l` -> 4), an absent or zero count means a single
/// repetition (`rd` -> 2, `0d` -> 1), and trailing digits with no symbol are
/// dropped. Carriage returns and newlines are ignored so a `\r`-terminated line
/// (as stored per path) doesn't inflate the count.
pub fn length(solution_path: &str) -> usize {
    let mut total = 0usize;
    let mut count = 0usize;
    let mut has_count = false;

    for &b in solution_path.as_bytes() {
        if b.is_ascii_digit() {
            count = count * 10 + (b - b'0') as usize;
            has_count = true;
        } else if b == b'\r' || b == b'\n' {
            // Ignore CR/LF; they are line terminators, not actions.
            count = 0;
            has_count = false;
        } else {
            total += if has_count && count > 0 { count } else { 1 };
            count = 0;
            has_count = false;
        }
    }

    total
}

/// Makespan of a solution: the longest decoded path length across all agents.
/// Each entry may be run-length encoded. Returns 0 for an empty solution.
pub fn makespan(solution: &[String]) -> usize {
    solution.iter().map(|p| length(p)).max().unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn measures_length() {
        assert_eq!(length("d3l"), 4);
        assert_eq!(length("2u"), 2);
        assert_eq!(length("rd"), 2);
        assert_eq!(length("10r"), 10);
        assert_eq!(length("0d"), 1);
        assert_eq!(length("uddudu"), 6);
        // Trailing CR is ignored.
        assert_eq!(length("d3l\r"), 4);
        assert_eq!(length(""), 0);
    }

    #[test]
    fn length_matches_decode() {
        for s in ["dlll", "uu", "rd", "10r", "0d", "uddudu", "d3l"] {
            assert_eq!(length(s), decode(s).len());
        }
    }

    #[test]
    fn computes_makespan() {
        assert_eq!(makespan(&["d3l".into(), "10r".into(), "uu".into()]), 10);
        assert_eq!(makespan(&[]), 0);
    }

    #[test]
    fn decodes_runs() {
        assert_eq!(decode("d3l"), "dlll");
        assert_eq!(decode("2u"), "uu");
        assert_eq!(decode("rd"), "rd");
        assert_eq!(decode("10r"), "rrrrrrrrrr");
        // Zero count behaves like one.
        assert_eq!(decode("0d"), "d");
    }

    #[test]
    fn round_trips() {
        for s in ["dlll", "uu", "rd", "rrrrrrrrrr", "uddudu"] {
            assert_eq!(decode(&encode(s)), s);
        }
    }
}
