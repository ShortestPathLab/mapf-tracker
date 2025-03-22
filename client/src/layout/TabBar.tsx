import { Box, BoxProps, Divider } from "@mui/material";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { round } from "lodash";
import { MutableRefObject, useRef, useState } from "react";
import { useRafLoop } from "react-use";
import { navbarHeight } from "./navbarHeight";

export function useTop(ref: MutableRefObject<HTMLElement>) {
  const sm = useXs();
  const threshold = navbarHeight(sm);
  const [top, setTop] = useState(true);
  useRafLoop(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTop(!(sm && round(rect.top) <= threshold));
    }
  });
  return top;
}

export function TabBar({ children, ...props }: BoxProps) {
  const xs = useXs();
  const sm = useSm();
  const ref = useRef<HTMLElement>(null);
  const top = useTop(ref);

  return (
    <Box
      ref={ref}
      {...props}
      sx={{
        borderBottom: 1,
        borderColor: "background.paper",
        mt: -2,
        mx: xs ? -2 : -3,
        px: xs ? 0 : 1,
        py: sm ? 0 : 1,
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: top ? "background.paper" : "background.default",
        ...props.sx,
      }}
    >
      {children}
      {(!sm || top) && <Divider flexItem />}
    </Box>
  );
}
