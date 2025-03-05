import {
  ConversionPathFilledRounded,
  ConversionPathRounded,
  HomeFilledRounded,
  HomeRounded,
  MoreHorizFilledRounded,
  MoreHorizRounded,
  SearchFilledRounded,
  SearchRounded,
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
    icon: <SearchRounded />,
    iconSelected: <SearchFilledRounded />,
  },
  {
    label: "Submissions",
    url: "/submissions",
    icon: <ConversionPathRounded />,
    iconSelected: <ConversionPathFilledRounded />,
  },
  {
    label: "More",
    url: "/manage",
    icon: <MoreHorizRounded />,
    iconSelected: <MoreHorizFilledRounded />,
  },
];
