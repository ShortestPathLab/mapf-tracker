export const identifier = "com.shortestpathlab.mapf-tracker";

export const url =
  // is localhost?
  window.location.hostname === "localhost"
    ? "http://118.138.234.90:8888/api"
    : "https://fe2410d1.pathfinding.ai/api";

export const appName = "MAPF Tracker";

export const appNameShort = "Tracker";

export const publisher = "ShortestPathLab";

export const appIconUrl = "/favicon.png";

export const APIConfig = {
  apiUrl: url,
};

export const version = "0.2.0";
