import { format, parse, parseISO } from "date-fns";
import { tryChain } from "./tryChain";

export const formatPercentage = (c: number, d: number = 2) =>
  `${(c * 100).toFixed(d)}%`;

export const DATE_TIME_FORMAT = "HH:mmaaa dd MMM yyyy";

export const formatDate = (c: unknown) => {
  return tryChain(
    () =>
      format(parse(c as string, "yyyy-MM-dd", new Date()), DATE_TIME_FORMAT),
    () => format(parseISO(c as string), DATE_TIME_FORMAT),
    () => format(c as Date, DATE_TIME_FORMAT),
    () => format(new Date(c as number), DATE_TIME_FORMAT),
    () => c as string
  );
};
