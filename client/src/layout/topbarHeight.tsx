export const topbarHeight = (sm?: boolean) =>
  // When sm, 64 is the height of the app bar
  // When not sm, 72 is the height of the breadcrumbs
  sm ? 64 : 72;

export const bottombarHeight = (sm?: boolean) => (sm ? 71 : 0);
