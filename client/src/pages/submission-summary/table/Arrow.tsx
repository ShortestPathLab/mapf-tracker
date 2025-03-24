import { ChevronRightRounded } from "@mui-symbols-material/w400";
import { ComponentProps } from "react";

export function Arrow({
  open,
  ...props
}: { open?: boolean } & ComponentProps<typeof ChevronRightRounded>) {
  return (
    <ChevronRightRounded
      color="action"
      {...props}
      sx={{
        my: "auto",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: (t) => t.transitions.create("transform"),
        ...props.sx,
      }}
    />
  );
}
