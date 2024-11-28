import { ChevronRight } from "@mui/icons-material";

export function Arrow({ open }: { open?: boolean }) {
  return (
    <ChevronRight
      color="action"
      sx={{
        my: "auto",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        transition: (t) => t.transitions.create("transform"),
      }}
    />
  );
}
