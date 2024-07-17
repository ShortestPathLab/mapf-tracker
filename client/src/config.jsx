const url =
  process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : "/api";
// const url = "https://tracker.pathfinding.ai/api";
export const APIConfig = {
  apiUrl: url,
};
