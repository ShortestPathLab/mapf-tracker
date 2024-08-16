import { Button } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <>
      This page doesn't seem to exist.
      <Link to="/">
        <Button variant="contained">Back to home</Button>
      </Link>
    </>
  );
}
