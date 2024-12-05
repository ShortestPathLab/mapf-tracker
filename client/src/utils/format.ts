import { format, parse, parseISO } from "date-fns";
import { tryChain } from "./tryChain";

export const formatPercentage = (c: number) => `${(c * 100).toFixed(2)}%`;

export const DATE_TIME_FORMAT = "HH:mmaaa, dd MMM yyyy";

export const formatDate = (c: any) => {
  return tryChain(
    () => format(parse(c, "yyyy-MM-dd", new Date()), DATE_TIME_FORMAT),
    () => format(parseISO(c), DATE_TIME_FORMAT),
    () => format(c, DATE_TIME_FORMAT),
    () => format(new Date(c), DATE_TIME_FORMAT),
    () => c
  );
};
