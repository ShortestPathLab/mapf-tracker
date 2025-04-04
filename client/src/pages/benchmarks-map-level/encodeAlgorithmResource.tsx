export const decodeAlgorithmResource = (s: string) => {
  const [algorithm, resource] = s.split(":");
  return { algorithm, resource };
};

export const encodeAlgorithmResource = (
  algorithm: string,
  resource: string
) => {
  return `${algorithm}:${resource}`;
};
