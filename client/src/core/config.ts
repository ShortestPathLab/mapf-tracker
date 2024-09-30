// const url = "http://118.138.234.90:8888/api";
const url = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";
// const url = "https://tracker.pathfinding.ai/api";

export const appName = "MAPF Tracker";

export const appIconUrl = "public/favicon.png";

export const APIConfig = {
  apiUrl: url,
};
