import {
  BottomNavigation,
  BottomNavigationAction,
  BottomNavigationActionProps,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useBottomBar } from "App";
import { bottomBarPaths } from "bottomBarPaths";
import { useNavigate } from "hooks/useNavigation";
import { find } from "lodash";
import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";

export function BottomBarAction(props: BottomNavigationActionProps) {
  return (
    <BottomNavigationAction
      disableRipple
      {...props}
      sx={{
        height: (t) => t.spacing(10),
        display: "flex",
        justifyContent: "center",
        "> svg": { transform: "scale(1)", mb: 0.5 },
        "> span": { fontWeight: 550, mt: 0.5 },
        "&::after": {
          opacity: 0,
          content: "''",
          display: "block",
          width: (t) => t.spacing(8),
          height: (t) => t.spacing(4),
          borderRadius: 4,
          position: "absolute",
          top: (t) => t.spacing(1.6),
          mx: "auto",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          transition: (t) => t.transitions.create("opacity"),
        },
        "&.Mui-selected": {
          "&::after": { opacity: 1 },
          "> svg": { color: "text.primary" },
          "> span": { fontSize: "0.75rem", color: "text.primary" },
        },
        ...props.sx,
      }}
    />
  );
}

export function BottomBar() {
  const { setEnabled } = useBottomBar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const selected = find(
    bottomBarPaths,
    (c) => !!matchPath(`${c?.url}/*`, pathname)
  )?.url;
  useEffect(() => {
    setEnabled?.(!!selected);
  }, [setEnabled, selected]);
  return (
    <BottomNavigation
      showLabels
      value={selected}
      sx={{
        bgcolor: "background.default",
        transition: (t) => t.transitions.create("transform"),
        transform: selected ? "translateY(0)" : "translateY(100%)",
        zIndex: (t) => t.zIndex.appBar + 1,
        position: "fixed",
        height: (t) => t.spacing(10),
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {bottomBarPaths.map(({ label, url, icon, iconSelected }) => (
        <BottomBarAction
          key={label}
          value={url}
          label={label}
          icon={selected === url ? iconSelected : icon}
          onClick={() => navigate(url)}
        />
      ))}
    </BottomNavigation>
  );
}
