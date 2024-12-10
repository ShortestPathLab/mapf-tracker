import { last } from "lodash";

export function parseMap(map: string): boolean[][] {
  // ignore the top 4 lines, we only want the map data,
  // which is separated by rows: \n, columns: ""
  const mapContent = map.trim().split(/\r?\n/).slice(4);

  // now convert any obstacles to "true" and free space to "false"
  return mapContent.map((row: any) =>
    [...row].map((val) => val === "@" || val === "T")
  );
}

export function parseMapMeta(map: string): {
  width: number;
  height: number;
  type: string;
} {
  const [type, height, width] = map.trim().split(/\r?\n/).slice(0, 4);
  const v = (c: string) => last(c.split(" "));
  return {
    width: +v(width),
    height: +v(height),
    type: v(type),
  };
}
