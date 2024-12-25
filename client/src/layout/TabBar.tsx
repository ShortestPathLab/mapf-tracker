import { Box } from "@mui/material";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { ReactNode, useRef, useState } from "react";
import { useRafLoop } from "react-use";
import { navbarHeight } from "./navbarHeight";

export function TabBar({ children }: { children?: ReactNode }) {
  const sm = useSm();
  const xs = useXs();
  const ref = useRef<HTMLElement>(null);
  const threshold = navbarHeight(sm);
  const [top, setTop] = useState(true);
  useRafLoop(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTop(!(sm && rect.top <= threshold));
    }
  });
  return (
    <Box
      ref={ref}
      sx={{
        borderBottom: 1,
        borderColor: "background.paper",
        mx: xs ? -2 : -3,
        px: xs ? 0 : 1,
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: top ? "background.default" : "background.paper",
      }}
    >
      {children}
    </Box>
  );
}
