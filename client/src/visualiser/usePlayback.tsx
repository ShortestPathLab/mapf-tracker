import { max, min } from "lodash";
import { useEffect, useState } from "react";

export function usePlayback(span: number) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    if (!paused) {
      const f = () => {
        setStep((p) => min([p + 1, span])!);
        setPaused(step === span);
      };
      const cancel = setInterval(f, 1000 / 30);
      return () => clearInterval(cancel);
    }
  }, [step, setStep, paused]);
  return {
    forwards: () => setStep((p) => min([p + 1, span])!),
    backwards: () => setStep((p) => max([p - 1, 0])!),
    play: () => setPaused(false),
    pause: () => setPaused(true),
    step,
    paused,
  };
}
