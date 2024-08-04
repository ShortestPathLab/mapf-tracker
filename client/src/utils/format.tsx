import { format, parse } from "date-fns";

export const formatPercentage = (c: number) => `${(c * 100).toFixed(2)}%`;

export const formatDate = (c: string) => {
  try {
    return format(parse(c, "yyyy-MM-dd", new Date()), "dd MMM yyyy");
  } catch (e) {
    return "(unknown)";
  }
};
