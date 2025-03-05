import { Route } from "components/Router";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import DirectoryPage from "pages/directory";
import SubmissionSummaryPage from "pages/submission-summary";
import Submissions from "./pages/algorithms";
import UserMapPage from "./pages/UserMapPage";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardOld from "./pages/admin-dashboard/index.old";
import ContributePage from "./pages/contribute";
import DocsPage from "./pages/docs";
import TrackSubmission from "./pages/submissions";
import Summary from "./pages/summary/DashboardPage";
import MakeASubmissionPage from "pages/make-a-submission";
import Visualiser from "./pages/visualiser";
import Hero from "pages/home/Hero";
import { AlgorithmPage } from "pages/algorithms/algorithm";

export const routes: Route[] = [
  {
    path: "/",
    content: (
      <DirectoryPage
        title="Home"
        description="The latest progress in multi-agent pathfinding"
        labels={["Browse", "Make a submission", "Docs"]}
        render={({ children }) => (
          <>
            <Hero />
            {children}
          </>
        )}
      />
    ),
  },
  {
    path: "/submit/:section?",
    content: <MakeASubmissionPage />,
    parent: "/",
  },
  {
    path: "/manage",
    content: (
      <DirectoryPage
        labels={["Make a submission", "Docs", "Settings"]}
        title="More"
      />
    ),
  },
  {
    path: "/benchmarks",
    content: <BenchmarksRootLevelPage />,
  },
  {
    path: "/scenarios",
    content: <BenchmarksMapLevelPage />,
    parent: "/benchmarks",
  },
  {
    path: "/instances",
    content: <BenchmarksScenarioLevelPage />,
    parent: "/scenarios",
  },
  { path: "/visualization", content: <Visualiser />, parent: "/instances" },
  { path: "/summary", content: <Summary />, parent: "/" },
  { path: "/submissions", content: <Submissions /> },
  {
    path: "/submissions/:id",
    content: <AlgorithmPage />,
    parent: "/submissions",
  },
  { path: "/contributes", content: <ContributePage />, parent: "submit" },
  {
    path: "/track",
    content: <TrackSubmission />,
    parent: "/",
  },
  {
    path: "/submissionSummary",
    content: <SubmissionSummaryPage />,
    parent: "/track",
  },
  {
    path: "/dashboard/:section?",
    content: <AdminDashboard />,
  },
  {
    path: "/docs/:article?",
    content: <DocsPage />,
    parent: "/",
  },
  {
    path: "/dashboard-old",
    content: <AdminDashboardOld />,
  },
  {
    path: "/user/maps",
    content: <UserMapPage />,
  },
];
