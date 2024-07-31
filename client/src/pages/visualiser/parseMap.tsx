export function parseMap(map: string): boolean[][] {
  // ignore the top 4 lines, we only want the map data,
  // which is separated by rows: \n, columns: ""
  const mapContent = map.trim().split(/\r?\n/).slice(4);

  // now convert any obstacles to "true" and free space to "false"
  return mapContent.map((row: any) =>
    [...row].map((val) => val === "@" || val === "T")
  );
}
