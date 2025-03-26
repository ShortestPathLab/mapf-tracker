import {
  BoxProps,
  DialogProps,
  PopoverProps,
  SwipeableDrawerProps,
} from "@mui/material";
import { ModalAppBarProps } from "./ModalAppBar";
import { ModalProps } from "./Modal";

export type SlotProps = {
  sheet?: Partial<SwipeableDrawerProps> & { gap?: number };
  appBar?: Partial<ModalAppBarProps>;
  popover?: Partial<PopoverProps>;
  paper?: Partial<BoxProps>;
  modal?: Partial<ModalProps> & DialogProps;
  scroll?: Omit<Partial<unknown>, "ref">;
};
