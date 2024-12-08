import { Card, Stack, Typography, Button } from "@mui/material";
import { useNavigate } from "hooks/useNavigation";
import React from "react";
import { paper } from "theme";

export default function TrackSubmissionHero() {
  const navigate = useNavigate();
  return (
    <Card sx={paper(0)}>
      <Stack sx={{ gap: 2, p: 2 }}>
        <Stack sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            I already have an API key
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            Congratulations! You can start submitting your solutions to the
            tracker.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/track")}
        >
          Start submitting
        </Button>
      </Stack>
    </Card>
  );
}
