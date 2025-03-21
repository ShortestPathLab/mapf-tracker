import {
  Card,
  CardActionArea,
  CardMedia,
  CardProps,
  Stack,
  Typography,
} from "@mui/material";
import { paper } from "theme";
import { Page } from "./pages";

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
            color: "text.secondary",
            backgroundImage: page?.cover ? `url(${page.cover})` : undefined,
          }}
        >
          {page?.icon}
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
