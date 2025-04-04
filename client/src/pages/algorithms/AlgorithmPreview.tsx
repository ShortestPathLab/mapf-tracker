import { Avatar, AvatarProps } from "@mui/material";

export function AlgorithmPreview({
  id,
  ...props
}: { id?: string } & AvatarProps) {
  return (
    <Avatar
      {...props}
      sx={{ width: 32, height: 32, ...props.sx }}
      src={`https://api.dicebear.com/9.x/identicon/svg?seed=${id}`}
    />
  );
}
