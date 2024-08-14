import { Button } from "@mui/material";
import { Layout } from "layout";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <Layout width={720} title="Oops" path={[{ name: "Home", url: "/" }]}>
      This page doesn't seem to exist.
      <Link to="/">
        <Button variant="contained">Back to home</Button>
      </Link>
    </Layout>
  );
}
