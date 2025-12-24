import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { DialogContentProps } from "hooks/useDialog";
import { useSnackbar } from "../Snackbar";
import { paper } from "theme";
import { useCredentials, useLogInMutation } from "../../queries/useLogInQuery";
import { useNavigate } from "hooks/useNavigation";
import BoringAvatar from "boring-avatars";

export function UserDialog({ onClose }: DialogContentProps) {
  const { data: credentials } = useCredentials();
  const notify = useSnackbar();
  const navigate = useNavigate();
  const {
    logOut: { mutateAsync: logOut },
  } = useLogInMutation();
  return (
    <Stack sx={{ gap: 4 }}>
      <ListItem sx={paper()}>
        <ListItemAvatar>
          <Avatar>
            <BoringAvatar name={credentials?.username} variant="ring" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={credentials?.username} secondary="Logged in" />
      </ListItem>
      <Button
        variant="contained"
        type="submit"
        onClick={async () => {
          notify("Logging out");
          await logOut();
          notify("Logged out");
          navigate("/");
          onClose?.();
        }}
      >
        Log out
      </Button>
    </Stack>
  );
}
