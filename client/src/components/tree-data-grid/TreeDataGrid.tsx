import { GridValidRowModel } from "@mui/x-data-grid";
import { DataGrid } from "components/data-grid";
import { DataGridProps } from "components/data-grid/DataGrid";
import { flatMap, flatMapDeep, isUndefined, map } from "lodash";
import { useMemo, useState } from "react";
import { useSet } from "react-use";

export type BooleanMap = { [K in string]?: boolean };

export function useBooleanMap() {
  return useState<BooleanMap>({});
}

export const toggle = (expanded: BooleanMap, id: string | number) => ({
  ...expanded,
  [id]: !expanded[id],
});

const defaultExpanded = {};
const defaultExpandedChange = () => {};
const defaultShouldIncludeItem = () => true;

export function TreeDataGrid<T extends GridValidRowModel>({
  rows,
  getChildren,
  expanded = defaultExpanded,
  onExpandedChange = defaultExpandedChange,
  shouldIncludeItem = defaultShouldIncludeItem,
  onRowClick,
  ...props
}: DataGridProps<T> & {
  onExpandedChange?: (u: BooleanMap) => void;
  expanded?: BooleanMap;
  getChildren?: (row: T) => T[] | undefined;
}) {
  const allRows = useMemo(() => {
    const f = (row: T): T[] => {
      const children = getChildren?.(row);
      // Is leaf
      if (isUndefined(children) && shouldIncludeItem(row, row.id)) return [row];
      // Is parent with 0 children
      if (children.length === 0) return [];
      // Is parent with children
      if (expanded[row.id]) return [row, ...flatMap(children, (v) => f(v))];
      // Should have exhausted all cases
      return [row];
    };
    return flatMap(rows, f);
  }, [rows, expanded, getChildren, shouldIncludeItem]);
  return (
    <DataGrid
      {...props}
      clickable
      rows={allRows}
      shouldIncludeItem={defaultShouldIncludeItem}
      onRowClick={(props, e, d) => {
        const { row, id } = props;
        getChildren?.(row)?.length && onExpandedChange?.(toggle(expanded, id));
        onRowClick?.(props, e, d);
      }}
    />
  );
}
