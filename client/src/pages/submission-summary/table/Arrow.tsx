import { ChevronRightRounded } from "@mui-symbols-material/w400";

export function Arrow({ open }: { open?: boolean }) {
  return (
    <ChevronRightRounded
      color="action"
      sx={{
        my: "auto",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: (t) => t.transitions.create("transform"),
      }}
    />
  );
}
