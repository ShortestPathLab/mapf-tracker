import { Avatar } from "@mui/material";

export function AlgorithmPreview({ id }: { id?: string }) {
  return (
    <Avatar src={`https://api.dicebear.com/9.x/identicon/svg?seed=${id}`} />
  );
}
