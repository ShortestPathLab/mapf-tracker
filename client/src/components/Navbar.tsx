import {
  DarkModeOutlined,
  ExpandMoreOutlined,
  LightModeOutlined,
  MenuOutlined,
  RouteOutlined,
  SortOutlined,
} from "@mui/icons-material";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MenuIcon from "@mui/icons-material/MenuOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import TableViewIcon from "@mui/icons-material/TableViewOutlined";
import {
  ButtonBase,
  ButtonGroup,
  Divider,
  ListItemText,
  MenuList,
  Stack,
  alpha,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { APIConfig } from "core/config";
import { useNavigate } from "hooks/useNavigation";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import * as React from "react";
import { useLocation } from "react-router-dom";
import { paper } from "theme";
import { ThemeContext } from "utils/ThemeProvider";
import { useSnackbar } from "./Snackbar";
import { useSm } from "./dialog/useSmallDisplay";

const settings = ["Dashboard", "Logout"];

function ResponsiveAppBar() {
  const sm = useSm();
  const [mode, toggleMode] = React.useContext(ThemeContext);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [login, setLogin] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenNavMenu = (event) => {
    // /**/;
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    // /**/;
    setAnchorElUser(event.currentTarget);
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  React.useEffect(() => {
    // if(localStorage.getItem('user')){
    //     setLogin(true);
    // }
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const decodedJwt = parseJwt(user.accessToken);
      if (decodedJwt.exp * 1000 < Date.now()) {
        localStorage.removeItem("user");
        setLogin(false);
        navigate("/");
      } else {
        setLogin(true);
      }
    }
  }, [location]);

  const handleCloseNavMenu = (page) => {
    // /**/;
    if (page === "BenchmarkResults") {
      navigate("/benchmarks");
    } else if (page === "BenchmarkDataset") {
      window.location.href = "https://movingai.com/benchmarks/mapf/index.html";
    } else if (page === "Summary") {
      navigate("/summary");
    } else if (page === "about") {
      navigate("/about");
    } else if (page === "Submissions") {
      navigate("/submissions");
    } else if (page === "SystemDemo") {
      navigate("/systemDemo");
    } else if (page === "GitHub") {
      window.location.href = "https://github.com/bshen95/MAPF-benchmark-web";
    } else if (page === "Paper") {
      // window.location.href = 'https://arxiv.org/abs/2305.08446';
      navigate("/papers");
    } else if (page === "Contribute") {
      navigate("/contributes");
    } else if (page === "Download") {
      navigate("/download");
      // window.location.href = 'http://tracker.pathfinding.ai/download';
    }

    // /**/;
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (page) => {
    // /**/;
    if (page === "Logout") {
      localStorage.removeItem("user");
      setLogin(false);
      navigate("/");
    } else if (page === "Dashboard") {
      navigate("/dashboard");
    }

    setAnchorElUser(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const push = useSnackbar();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password: data.get("password"),
      }),
    };

    fetch(APIConfig.apiUrl + "/auth/signin", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          localStorage.setItem("user", JSON.stringify(data));
          setOpen(false);
          setLogin(true);
          push("Logged in.");
          navigate("/dashboard");
        } else {
          alert("Please enter the correct username and password");
        }
        return data;
      })
      .catch((err) => console.error(err));
  };

  const handleClickLogin = (event) => {
    setOpen(true);
    event.stopPropagation();
  };

  return sm ? (
    <AppBar sx={{ background: "transparent" }}>
      <Toolbar
        sx={{
          height: 64,
          ...paper(),
          borderRadius: 0,
          border: "none",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <IconButton edge="start">
          <MenuOutlined />
        </IconButton>
        <Typography variant="h6">Tracker</Typography>
      </Toolbar>
    </AppBar>
  ) : (
    // <AppBar  style={{position:"static",background: "grey"}}>
    <AppBar
      elevation={0}
      sx={{
        backdropFilter: "blur(16px)",
        bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
        top: 0,
        bottom: "auto",
        position: "sticky",
        marginBottom: 4,
        color: "text.primary",
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <ButtonBase sx={{ borderRadius: 1 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <RouteOutlined />
              <Typography
                variant="h6"
                noWrap
                onClick={() => navigate("/")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  fontWeight: 600,
                  letterSpacing: -0.5,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                MAPF Tracker
              </Typography>
            </Stack>
          </ButtonBase>

          <Box sx={{ flexGrow: 1, display: { md: "flex", lg: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { md: "block", lg: "none" },
              }}
            >
              <MenuItem
                key="BenchmarkResults"
                onClick={() => handleCloseNavMenu("BenchmarkResults")}
              >
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<TableViewIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  Benchmarks
                </Button>
              </MenuItem>
              <MenuItem
                key="Submissions"
                onClick={() => handleCloseNavMenu("Submissions")}
              >
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<AssignmentIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  Algorithms
                </Button>
              </MenuItem>
              <MenuItem
                key="SystemDemo"
                onClick={() => handleCloseNavMenu("SystemDemo")}
              >
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<ArticleIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  Demo
                </Button>
              </MenuItem>

              <MenuItem
                key="Paper"
                onClick={() => handleCloseNavMenu("Download")}
              >
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<DownloadIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  Dataset
                </Button>
              </MenuItem>
              <MenuItem key="about" onClick={() => handleCloseNavMenu("about")}>
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<PeopleIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  About Us
                </Button>
              </MenuItem>
              <MenuItem
                key="GitHub"
                onClick={() => handleCloseNavMenu("GitHub")}
              >
                <Button
                  sx={{ textTransform: "none" }}
                  startIcon={<GitHubIcon />}
                  style={{ backgroundColor: "transparent" }}
                  disableElevation
                  disableRipple
                >
                  GitHub
                </Button>
              </MenuItem>
            </Menu>
          </Box>
          <Stack
            direction="row"
            sx={{
              flex: 1,
              overflowX: "auto",
              p: 1,
              mr: 4,
              display: { xs: "none", sm: "none", md: "none", lg: "flex" },
              "> *": { minWidth: "max-content !important" },
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, height: 32, alignSelf: "center" }}
            />
            <Button
              key="BenchmarkResults"
              onClick={() => handleCloseNavMenu("BenchmarkResults")}
              sx={{
                my: 2,
                px: 2,
                color: "text.primary",
              }}
              startIcon={<SortOutlined />}
            >
              Benchmarks
            </Button>
            <Button
              key="Submissions"
              onClick={() => handleCloseNavMenu("Submissions")}
              sx={{
                my: 2,
                px: 2,
                color: "text.primary",
              }}
            >
              Algorithms
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, height: 32, alignSelf: "center" }}
            />
            <Button
              key="Download"
              onClick={() => handleCloseNavMenu("Download")}
              sx={{
                my: 2,
                px: 2,
                color: "text.primary",
              }}
            >
              Dataset
            </Button>
            <Button
              key="SystemDemo"
              onClick={() => handleCloseNavMenu("SystemDemo")}
              sx={{
                my: 2,
                px: 2,
                color: "text.primary",
              }}
            >
              Demo
            </Button>
            <Button
              key="about"
              onClick={() => handleCloseNavMenu("about")}
              sx={{
                my: 2,
                px: 2,
                color: "text.primary",
              }}
            >
              About
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, height: 32, alignSelf: "center" }}
            />
            <IconButton
              key="GitHub"
              onClick={() => handleCloseNavMenu("GitHub")}
              sx={{
                my: 2,
                color: "text.primary",
              }}
            >
              <GitHubIcon />
            </IconButton>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 2, height: 32, alignSelf: "center" }}
            />
            <IconButton
              onClick={toggleMode}
              sx={{
                my: 2,
                color: "text.primary",
              }}
            >
              {mode === "light" ? <DarkModeOutlined /> : <LightModeOutlined />}
            </IconButton>
          </Stack>
          <ButtonGroup
            sx={{
              justifySelf: "flex-end",
              my: 2,
              mr: 4,
            }}
          >
            <Button
              key="Contribute"
              onClick={() => handleCloseNavMenu("Contribute")}
              variant="contained"
              sx={{ px: 2, py: 1 }}
            >
              Submit an algorithm
            </Button>
            <PopupState variant="popover">
              {(state) => (
                <>
                  <Button
                    {...bindTrigger(state)}
                    size="small"
                    sx={{ px: 0, py: 1 }}
                    variant="contained"
                  >
                    <ExpandMoreOutlined />
                  </Button>
                  <Menu
                    {...bindMenu(state)}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  >
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          navigate("/track");
                          state.close();
                        }}
                      >
                        <ListItemText>Manage submissions</ListItemText>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              )}
            </PopupState>
          </ButtonGroup>
          <Box>
            {/*<Tooltip title="Login">*/}
            {login ? (
              <Tooltip
                title={JSON.parse(localStorage.getItem("user")).username}
              >
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar>
                    {JSON.parse(localStorage.getItem("user"))
                      .username.charAt(0)
                      .toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Login">
                <IconButton onClick={handleClickLogin} sx={{ p: 0 }}>
                  <Avatar></Avatar>
                </IconButton>
              </Tooltip>
            )}
            {/*</Tooltip>*/}
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleCloseUserMenu(setting)}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>

            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="scroll-dialog-title"
              aria-describedby="scroll-dialog-description"
            >
              <DialogTitle id="scroll-dialog-title">
                Welcome to MAPF
              </DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    Sign in
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="User Name"
                      name="username"
                      autoComplete="username"
                      autoFocus
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
