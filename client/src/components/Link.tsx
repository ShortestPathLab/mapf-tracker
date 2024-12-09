import { Link as MuiLink } from "@mui/material";
import { useNavigate } from "hooks/useNavigation";

export function Link({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <MuiLink onClick={() => navigate(href)} sx={{ cursor: "pointer" }}>
      {children}
    </MuiLink>
  );
}
