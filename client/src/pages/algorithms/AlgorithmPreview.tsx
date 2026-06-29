import { Avatar, AvatarProps } from "@mui/material";
import BoringAvatar from "boring-avatars";

export function AlgorithmPreview({ id, ...props }: { id?: string } & AvatarProps) {
  return (
    <Avatar {...props} sx={{ width: 32, height: 32, ...props.sx }}>
      <BoringAvatar name={id} />
    </Avatar>
  );
}
