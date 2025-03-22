import { Box, Chip } from "@mui/material";
import { map } from "lodash";
import { ReactNode } from "react";

export function renderSelectChip(
  f: (id: string) => ReactNode,
  max: number = 3
) {
  return (selected?: string[]) => {
    const firstFew = selected?.slice(0, max);
    const restCount = selected?.length - firstFew.length;
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
