import { Card, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "hooks/useNavigation";
import React from "react";

export default function TrackSubmissionHero() {
  const navigate = useNavigate();
  return (
    <Card>
      <Stack
        direction="row"
        sx={{ flexWrap: "wrap", gap: 2, p: 2, alignItems: "center" }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Already have a submission key?
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/trackSubmission")}
        >
          Track my submission
        </Button>
      </Stack>
    </Card>
  );
}
