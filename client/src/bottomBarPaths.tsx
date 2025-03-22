import {
  ConversionPathFilledRounded,
  ConversionPathRounded,
  HomeFilledRounded,
  HomeRounded,
  MoreHorizFilledRounded,
  MoreHorizRounded,
  TableFilledRounded,
  TableRounded,
} from "@mui-symbols-material/w400";

export const bottomBarPaths = [
  {
    label: "Home",
    url: "/",
    icon: <HomeRounded />,
    iconSelected: <HomeFilledRounded />,
  },
  {
    label: "Benchmarks",
    url: "/benchmarks",
    icon: <TableRounded />,
    iconSelected: <TableFilledRounded />,
  },
  {
    label: "Submissions",
    url: "/submissions",
    icon: <ConversionPathRounded />,
    iconSelected: <ConversionPathFilledRounded />,
  },
  {
    label: "More",
    url: "/more",
    icon: <MoreHorizRounded />,
    iconSelected: <MoreHorizFilledRounded />,
  },
];
