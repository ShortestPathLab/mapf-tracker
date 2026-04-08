import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardProps,
  Stack,
  Typography,
} from "@mui/material";
import { paper } from "theme";
import { Page } from "./pages";
import BoringAvatar from "boring-avatars";

export function ArticleCard({ page, ...props }: { page?: Page } & CardProps) {
  return (
    <Card sx={paper(1)} {...props}>
      <CardActionArea
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        <CardMedia
          sx={{
            // ...paper(1),
            borderRadius: 0,
            border: "none",
            height: 120,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: page?.cover ? `url(${page.cover})` : undefined,
            position: "relative",
          }}
        >
          {!page?.cover && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <BoringAvatar
                colors={["#edae49", "#d1495b", "#00798c", "#30638e", "#003d5b"]}
                preserveAspectRatio="none"
                square
                size="100%"
                name={page?.label || ""}
              />
            </Box>
          )}
          <Box sx={{ zIndex: 1, color: "white" }}>{page?.icon}</Box>
        </CardMedia>
        <Stack sx={{ p: 2 }}>
          <Typography gutterBottom variant="h6" component="div">
            {page?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {page?.description}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
