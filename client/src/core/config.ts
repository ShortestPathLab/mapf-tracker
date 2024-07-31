const url = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";
// const url = "https://tracker.pathfinding.ai/api";

export const APIConfig = {
  apiUrl: url,
};
