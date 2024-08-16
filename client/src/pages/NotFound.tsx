import { Button } from "@mui/material";
import { NotFound } from "components/NotFound";
import { Layout } from "layout";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Layout width={720} title="Oops" path={[{ name: "Home", url: "/" }]}>
      <NotFound />
    </Layout>
  );
}
