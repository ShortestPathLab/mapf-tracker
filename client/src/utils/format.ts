import { format, parse, parseISO } from "date-fns";
import { tryChain } from "./tryChain";

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
        () => c as string
      )
    : "--";
};
