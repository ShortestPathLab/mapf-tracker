import { Breadcrumbs, Divider, Link, Typography } from "@mui/material";
import { useNavigate } from "hooks/useNavigation";
import { PageHeaderProps } from "./PageHeader";

export const Crumbs = ({ path, current }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <>
      <Breadcrumbs sx={{ overflowX: "auto", p: 3 }}>
        {path.map(({ name, url, state }) => (
          <Link
            sx={{ cursor: "pointer" }}
            underline="hover"
            color="inherit"
            onClick={() => navigate(url, state)}
          >
            <Typography variant="body1">{name}</Typography>
          </Link>
        ))}
        <Typography color="text.primary" variant="body1">
          {current}
        </Typography>
      </Breadcrumbs>
      <Divider />
    </>
  );
};
