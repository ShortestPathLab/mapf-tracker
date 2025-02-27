import { ExpandFilledOutlined } from "@mui-symbols-material/w400";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Dialog, Title } from "components/dialog";
import { find, head, map } from "lodash";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { ReactNode, SyntheticEvent, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";

type Variant = {
  name: string;
  description?: string;
  render: () => ReactNode;
};

type Template = {
  name: string;
  icon: ReactNode;
  variants: Variant[];
};

export function Analysis({ template }: { template: Template[] }) {
  return (
    <Stack direction="column" sx={{ gap: 2 }}>
      {map(template, ({ variants, name }) => (
        <Stack
          direction="column"
          sx={{
            boxShadow: (t) => `inset 0px 0px 0px 1px ${t.palette.divider}`,
            borderRadius: 1,
          }}
        >
          {name && (
            <Typography
              sx={{ p: 2, py: 1 }}
              variant="overline"
              color="text.secondary"
            >
              {name}
            </Typography>
          )}
          <Chart data={variants} />
        </Stack>
      ))}
    </Stack>
  );
}

export function AnalysisButton({
  template,
  button = (onClick) => (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{ px: 2, py: 1, mr: 1, minWidth: "max-content" }}
      endIcon={<ExpandFilledOutlined />}
    >
      Trends
    </Button>
  ),
}: {
  template: Template[];
  button?: (onClick: (e: SyntheticEvent<Element, Event>) => void) => ReactNode;
}) {
  const single = template.length == 1;
  return single ? (
    <Dialog
      slotProps={{
        modal: {
          width: "100vw",
          variant: "default",
          fullScreen: true,
          height: "100vh",
        },
      }}
      appBar={{ children: <Title>{head(template).name}</Title> }}
      trigger={(onClick) => button(onClick)}
    >
      <Chart data={head(template).variants} />
    </Dialog>
  ) : (
    <PopupState variant="popover">
      {(state) => (
        <>
          {button(state.open)}
          <Menu
            {...bindMenu(state)}
            keepMounted
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuList>
              {map(template, ({ icon, name, variants }, index) => (
                <Dialog
                  slotProps={{ modal: { width: 1600, variant: "default" } }}
                  appBar={{ children: <Title>{name}</Title> }}
                  trigger={(onClick) => (
                    <MenuItem
                      key={index}
                      onClick={(e) => {
                        onClick(e);
                        state.close();
                      }}
                    >
                      <ListItemIcon>{icon}</ListItemIcon>
                      <ListItemText>{name}</ListItemText>
                    </MenuItem>
                  )}
                >
                  <Chart data={variants} />
                </Dialog>
              ))}
            </MenuList>
          </Menu>
        </>
      )}
    </PopupState>
  );
}

function Chart({ data }: { data: Variant[] }) {
  const [tab, setTab] = useState(head(data)?.name);
  const current = find(data, { name: tab });
  const height = 720;
  return (
    <AutoSizer style={{ width: "100%", height }}>
      {({ width: w }) => (
        <Stack
          sx={{
            height,
            width: w,
            borderTop: () => "none",
          }}
        >
          <Stack
            direction={"column"}
            sx={{
              height: "100%",
            }}
          >
            <Tabs
              variant="scrollable"
              value={tab}
              onChange={(_, f) => setTab(f)}
              orientation={"horizontal"}
              sx={{
                borderRight: "none",
              }}
            >
              {map(data, ({ name }) => (
                <Tab
                  key={name}
                  value={name}
                  label={name}
                  sx={{ alignItems: "flex-start", px: 2 }}
                />
              ))}
            </Tabs>
            <Stack sx={{ p: 2, flex: 1, gap: 2 }}>{current?.render()}</Stack>
          </Stack>
        </Stack>
      )}
    </AutoSizer>
  );
}
