import { formatDuration, intervalToDuration } from "date-fns";
import { max, now } from "lodash";
import { useReducer } from "react";
import { useHarmonicIntervalFn } from "react-use";

export function Counter({ start }: { start: number }) {
  const [time, tick] = useReducer(() => now(), now());
  useHarmonicIntervalFn(tick, 1000);
  return (
    formatDuration(intervalToDuration({ start, end: max([start, time]) })) ||
    "0 seconds"
  );
}
