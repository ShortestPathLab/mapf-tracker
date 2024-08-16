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
import {
  useCredentials,
  useLogInMutation,
  Credentials,
} from "../../queries/useLogInQuery";
import { useNavigate } from "hooks/useNavigation";

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
          <Avatar src={getAvatar(credentials)} />
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
export function getAvatar(credentials?: Credentials): string {
  return `https://api.dicebear.com/9.x/dylan/svg?seed=${credentials?.username}`;
}
