import { Button } from "@mui/material";
import { Tip } from "components/Tip";
import { useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";

export default function index() {
  const navigate = useNavigate();
  return (
    <Layout
      flat
      width={960}
      title="Admin users"
      path={[
        { name: "More", url: "/more" },
        { name: "Manage", url: "/dashboard" },
      ]}
    >
      <Tip
        title="Admin users (coming soon)"
        description="Manage users who can access management options. Create, edit, and delete users."
        actions={
          <>
            <Button sx={{ m: -1, mt: 0 }} onClick={() => navigate(-1)}>
              Go back
            </Button>
          </>
        }
      />
    </Layout>
  );
}
