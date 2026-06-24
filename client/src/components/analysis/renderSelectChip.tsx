import { Box, Chip } from "@mui/material";
import { map } from "lodash";
import { ReactNode } from "react";

export function renderSelectChip(
  f: (id: string) => ReactNode,
  max: number = 3
) {
  return (value: unknown) => {
    // MUI Select renderValue passes the selected value(s) as unknown; here it is the array of selected ids
    const selected = value as string[] | undefined;
    const firstFew = selected?.slice(0, max) ?? [];
    const restCount = (selected?.length ?? 0) - firstFew.length;
    return (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {map(firstFew, (value) => (
          <Chip sx={{ height: 22 }} key={value} label={f(value)} size="small" />
        ))}
        {!!restCount && (
          <>
            <Chip sx={{ height: 22 }} label={`+${restCount}`} size="small" />
          </>
        )}
      </Box>
    );
  };
}
