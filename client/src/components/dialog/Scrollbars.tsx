import { useTheme } from "@mui/material";
import { OverlayScrollbars } from "overlayscrollbars";
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
} from "overlayscrollbars-react";
import "overlayscrollbars/styles/overlayscrollbars.css";
import {
  ForwardedRef,
  ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCss } from "react-use";

type ScrollProps = {
  children?: ReactNode;
  x?: boolean;
  y?: boolean;
  px?: number;
  py?: number;
  fadeX?: boolean;
};

const ScrollContext = createContext<HTMLDivElement | null>(null);

export function useScroll() {
  return useContext(ScrollContext);
}

export const Scroll = forwardRef(
  (
    {
      children,
      fadeX,
      x,
      y,
      px = 0,
      py = 0,
      ...rest
    }: ScrollProps & OverlayScrollbarsComponentProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [panel, setPanel] = useState<HTMLDivElement | null>(null);
    const { palette, spacing } = useTheme();
    const cls = useCss({
      "--os-padding-perpendicular": "2px",
      "div.os-scrollbar-vertical > div.os-scrollbar-track": {
        height: `calc(100% - ${spacing(px)})`,
        marginTop: spacing(px),
      },
      "div.os-scrollbar-horizontal > div.os-scrollbar-track": {
        width: `calc(100% - ${spacing(py * 2)})`,
        marginLeft: spacing(py),
      },
      "div > div.os-scrollbar-track": {
        "--os-handle-perpendicular-size": "2px",
        "--os-handle-perpendicular-size-hover": "6px",
        "--os-handle-perpendicular-size-active": "6px",
        "> div.os-scrollbar-handle": {
          borderRadius: 0,
          opacity: 0.5,
          "&:hover": { opacity: 0.8 },
        },
      },
    });
    const handleRef = useCallback(
      (instance: OverlayScrollbars) => {
        if (instance) {
          const viewport = instance.elements().viewport;
          if (viewport) {
            if (ref) {
              if (typeof ref === "function") {
                ref?.(viewport as HTMLDivElement);
              } else {
                ref.current = viewport as HTMLDivElement;
              }
            }
            setPanel(viewport as HTMLDivElement);
          }
        }
      },
      [ref, setPanel]
    );
    useEffect(() => {
      if (panel && fadeX) {
        const controller = new AbortController();
        const f = () => {
          const gradient = (direction: string) =>
            `linear-gradient(to ${direction}, transparent, black 8px)`;
          const hasRight =
            Math.abs(
              panel.scrollWidth - panel.scrollLeft - panel.clientWidth
            ) >= 1;
          const hasLeft = !!panel.scrollLeft;
          panel.style.maskImage =
            hasLeft && hasRight
              ? "linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent 100%)"
              : hasRight
              ? gradient("left")
              : hasLeft
              ? gradient("right")
              : "";
          if (!controller.signal.aborted) {
            requestAnimationFrame(f);
          }
        };
        requestAnimationFrame(f);
        return () => {
          controller.abort();
        };
      }
    }, [panel, fadeX]);
    return (
      <ScrollContext.Provider value={panel}>
        <OverlayScrollbarsComponent
          options={{
            overflow: {
              x: x ? "scroll" : "hidden",
              y: y ? "scroll" : "hidden",
            },
            scrollbars: {
              autoHide: "leave",
              theme:
                palette.mode === "dark" ? "os-theme-light" : "os-theme-dark",
            },
          }}
          {...rest}
          style={{
            width: "100%",
            height: "100%",
            ...rest.style,
          }}
          className={`${cls} scrollbars ${rest.className}`}
          events={{ initialized: handleRef }}
        >
          {children}
        </OverlayScrollbarsComponent>
      </ScrollContext.Provider>
    );
  }
);
