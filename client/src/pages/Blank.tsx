import { Button } from "@mui/material";
import { NotFound } from "components/NotFound";
import { Layout } from "layout";
import { Link } from "react-router-dom";

export function BlankPage() {
  return <Layout title="" path={[{ name: "Home", url: "/" }]} />;
}
