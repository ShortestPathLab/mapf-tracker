import { Elysia } from "elysia";
import * as algorithm from "../../controllers/algorithm";

// Static segments registered before any `:id` param routes.
export const algorithmRoutes = new Elysia({ prefix: "/api/algorithm" })
  .get("/", algorithm.findAll)
  .get("/all_detail", algorithm.findAllDetails)
  .get("/getClosedInfo", algorithm.findBestClosed)
  .get("/getLowerInfo", algorithm.findBestLower)
  .get("/getSolutionInfo", algorithm.findBestSolution)
  .get("/getSolvedInfo", algorithm.findBestSolved)
  .get("/test", algorithm.findBestLowerDomainQuery)
  .get("/getDomainClosedInfo", algorithm.findClosedDomainQuery)
  .get("/getDomainSolvedInfo", algorithm.findSolvedDomainQuery)
  .get("/getDomainLowerInfo", algorithm.findBestLowerDomainQuery)
  .get("/getDomainSolutionInfo", algorithm.findBestSolutionDomainQuery)
  .get("/getScenClosedInfo/:id", algorithm.findScenBestClosed)
  .get("/getScenSolvedInfo/:id", algorithm.findScenBestSolved)
  .get("/getScenLowerInfo/:id", algorithm.findScenBestLower)
  .get("/getScenSolutionInfo/:id", algorithm.findScenBestSolution)
  .get("/getAgentClosedInfo/:id", algorithm.findAgentBestClosed)
  .get("/getAgentSolvedInfo/:id", algorithm.findAgentBestSolved)
  .get("/getAgentLowerInfo/:id", algorithm.findAgentBestLower)
  .get("/getAgentSolutionInfo/:id", algorithm.findAgentBestSolution)
  .get("/getAgentSolutionCost/:pair", algorithm.findAgentSolutionCost)
  .get("/getAgentLower/:pair", algorithm.findAgentLower);
