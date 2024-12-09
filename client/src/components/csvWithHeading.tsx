import Prism from "prismjs";

function csvWithHeading(p: typeof Prism) {
  p.languages["csv-with-heading"] = {
    // First line matcher (e.g., for headers)
    header: {
      pattern: /^.*(?:\r?\n|$)/, // Matches the first line until a newline
      greedy: true, // Ensures multiline matches consume all the content
      inside: {
        quoted: {
          pattern: /"(?:[^"]|"")*"/, // Matches quoted fields
          greedy: true,
          alias: "symbol",
        },
        symbol: /[^",\r\n]+/, // Matches unquoted fields
        delimiter: /,/, // Matches commas
      },
    },
    // Other lines matcher
    row: {
      pattern: /.+(?:\r?\n|$)/g, // Matches subsequent lines
      inside: {
        quoted: {
          pattern: /"(?:[^"]|"")*"/, // Matches quoted fields
          greedy: true,
          alias: "string",
          inside: {
            punctuation: {
              pattern: /\u21B5/,
              alias: "carriage-return",
              greedy: true,
            },
          },
        },
        value: {
          pattern: /[^",\r\n]+/,
          greedy: true,
          inside: {
            boolean: /^(TRUE)|(FALSE)$/,
            number: /^[0-9]+$/,
          },
        }, // Matches unquoted fields
        delimiter: /,/, // Matches commas
      },
    },
    comment: {
      pattern: /^#.*/m, // Matches comments starting with #
      greedy: true,
    },
  };
}
csvWithHeading.displayName = "csv-with-heading";

export default csvWithHeading;
