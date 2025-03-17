import { Avatar, AvatarProps } from "@mui/material";

export function AlgorithmPreview({
  id,
  ...props
}: { id?: string } & AvatarProps) {
  return (
    <Avatar
      {...props}
      src={`https://api.dicebear.com/9.x/identicon/svg?seed=${id}`}
    />
  );
}
