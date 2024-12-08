export const setFromEvent =
  <T, U extends (t: T) => void>(f: U) =>
  (e: { target: { value: T } }) => {
    f(e.target.value);
  };

export const setFromParam =
  <T, Params extends []>(f: (t: T) => void, index: number = 1) =>
  (...args: Params) => {
    f(args[index]);
  };
