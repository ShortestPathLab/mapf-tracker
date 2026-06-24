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

#[cfg(test)]
mod tests {
    use super::*;

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
