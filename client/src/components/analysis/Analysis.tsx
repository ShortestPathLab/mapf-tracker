import { ExpandFilledRounded } from "@mui-symbols-material/w400";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography,
} from "@mui/material";
import { FlatCard } from "components/FlatCard";
import { GridChartCard } from "components/charts/GridChartCard";
import { Dialog, Title } from "components/dialog";
import { head, map } from "lodash";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { ReactNode, SyntheticEvent } from "react";

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
        <Stack direction="column">
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
      endIcon={<ExpandFilledRounded />}
    >
      Trends
    </Button>
  ),
}: {
  template: Template[];
  button?: (onClick: (e: SyntheticEvent<Element, Event>) => void) => ReactNode;
}) {
  const single = template?.length == 1;
  return single ? (
    <Dialog
      slotProps={{
        modal: {
          width: "100vw",
          variant: "default",
          fullScreen: true,
          height: "100dvh",
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
  const height = "70dvh";
  return (
    <FlatCard>
      <Stack sx={{ gap: 2 }}>
        {data?.map?.(({ name, render, description }, i) => (
          <GridChartCard
            key={i}
            primaryLabel={name}
            secondaryLabel={description}
            columns={1}
            height={height}
            content={render?.()}
          />
        ))}
      </Stack>
    </FlatCard>
  );
}
