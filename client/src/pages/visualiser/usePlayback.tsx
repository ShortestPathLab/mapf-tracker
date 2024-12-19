import { delay, max, min } from "lodash";
import { useEffect, useState } from "react";

export function usePlayback(span: number) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    if (paused) return;
    let cancelled = false;
    const f = () => {
      if (cancelled) return;
      setStep((p) => min([p + 1, span])!);
      setPaused(step === span);
      delay(f, 1000 / 24);
    };
    requestAnimationFrame(f);
    return () => void (cancelled = true);
  }, [step, setStep, paused]);
  return {
    forwards: () => setStep((p) => min([p + 1, span])!),
    backwards: () => setStep((p) => max([p - 1, 0])!),
    play: () => setPaused(false),
    pause: () => setPaused(true),
    restart: () => {
      setPaused(true);
      setStep(() => 0);
    },
    step,
    paused,
  };
}
