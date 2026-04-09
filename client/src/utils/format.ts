import { format, parse, parseISO } from "date-fns";
import { tryChain } from "./tryChain";
import { capitalize, startCase } from "lodash";

export const formatPercentage = (c: number, d: number = 2) =>
  `${((isNaN(c) ? 0 : c) * 100).toFixed(d)}%`;

export const DATE_FORMAT = "dd MMM yyyy";

export const DATE_TIME_FORMAT = "MMM dd yyyy HH:mm aaa";

export const formatDate = (c: unknown, formatStr = DATE_FORMAT) => {
  return c
    ? tryChain(
        () => format(parse(c as string, "yyyy-MM-dd", new Date()), formatStr),
        () => format(parseISO(c as string), formatStr),
        () => format(c as Date, formatStr),
        () => format(new Date(c as number), formatStr),
        () => c as string,
      )
    : "--";
};

export const prose = (v: string) => capitalize(startCase(v));

export function formatScientific(n: number, significantFigures = 3): string {
  if (n === 0) return "0";

  // 👇 only use scientific notation if |n| > 10
  if (Math.abs(n) <= 10) {
    return n.toString();
  }

  const exponent = Math.floor(Math.log10(Math.abs(n)));
  const mantissa = n / Math.pow(10, exponent);

  const roundedMantissa = Number(mantissa.toPrecision(significantFigures));

  return `${roundedMantissa}e${exponent}`;
}
