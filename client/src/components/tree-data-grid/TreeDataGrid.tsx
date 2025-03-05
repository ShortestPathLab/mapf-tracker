import { GridValidRowModel } from "@mui/x-data-grid";
import { DataGrid } from "components/data-grid";
import { DataGridProps } from "components/data-grid/DataGrid";
import { flatMap, isUndefined } from "lodash";
import { useMemo, useState } from "react";

export type BooleanMap = { [K in string]?: boolean };

export function useBooleanMap(defaultValue: BooleanMap = {}) {
  return useState<BooleanMap>(defaultValue);
}

export const toggle = (expanded: BooleanMap, id: string | number) => ({
  ...expanded,
  [id]: !expanded[id],
});

const defaultExpandedMap = {};
const defaultExpandedChange = () => {};
const defaultShouldIncludeItem = () => true;

export function TreeDataGrid<T extends GridValidRowModel>({
  rows,
  getChildren,
  expanded: toggled = defaultExpandedMap,
  onExpandedChange = defaultExpandedChange,
  shouldIncludeItem = defaultShouldIncludeItem,
  onRowClick,
  defaultExpanded,
  ...props
}: DataGridProps<T> & {
  defaultExpanded?: boolean;
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
      if (defaultExpanded ? !toggled[row.id] : toggled[row.id])
        return [row, ...flatMap(children, (v) => f(v))];
      // Should have exhausted all cases
      return [row];
    };
    return flatMap(rows, f);
  }, [rows, toggled, getChildren, shouldIncludeItem, defaultExpanded]);
  return (
    <DataGrid
      {...props}
      clickable
      rows={allRows}
      shouldIncludeItem={defaultShouldIncludeItem}
      onRowClick={(props, e, d) => {
        const { row, id } = props;
        if (getChildren?.(row)?.length) onExpandedChange?.(toggle(toggled, id));
        onRowClick?.(props, e, d);
      }}
    />
  );
}
