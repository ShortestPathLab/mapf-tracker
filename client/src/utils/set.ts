export const setFromEvent =
  <T>(f: (t: T) => void) =>
  (e: { target: { value: any } }) => {
    f(e.target.value);
  };

export const setFromParam =
  <T>(f: (t: T) => void, index: number = 1) =>
  (...args: any[]) => {
    f(args[index]);
  };
