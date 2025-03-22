import { Footer } from "Footer";
import { Route } from "components/Router";
import { useMd } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { defer } from "lodash";
import { AlgorithmPage } from "pages/algorithms/algorithm";
import BenchmarksMapLevelPage from "pages/benchmarks-map-level";
import BenchmarksRootLevelPage from "pages/benchmarks-root-level";
import BenchmarksScenarioLevelPage from "pages/benchmarks-scenario-level";
import DirectoryPage from "pages/directory";
import Hero from "pages/home/Hero";
import MakeASubmissionPage from "pages/make-a-submission";
import SubmissionSummaryPage from "pages/submission-summary";
import UserMapPage from "./pages/UserMapPage";
import AdminDashboard from "./pages/admin-dashboard";
import AdminDashboardOld from "./pages/admin-dashboard/index.old";
import Submissions from "./pages/algorithms";
import ContributePage from "./pages/contribute";
import DocsPage from "./pages/docs";
import TrackSubmission from "./pages/submissions";
import Summary from "./pages/summary/DashboardPage";
import Visualiser from "./pages/visualiser";

function ManagePage() {
  const md = useMd();
  const navigate = useNavigate();
  if (!md) defer(() => navigate("/"));
  return (
    md && (
      <DirectoryPage
        labels={["Make a submission", "Docs", "Settings", "More"]}
        title="More"
      />
    )
  );
}

export const routes: Route[] = [
  {
    path: "/",
    content: (
      <DirectoryPage
        title="Home"
        description="The latest progress in multi-agent pathfinding"
        labels={["Browse", "Make a submission", "Docs", "Settings", "More"]}
        render={() => (
          <>
            <Hero />
            <Footer />
          </>
        )}
      />
    ),
  },
  {
    path: "/more",
    content: <ManagePage />,
  },
  {
    path: "/submit/:section?",
    content: <MakeASubmissionPage />,
    parent: "/more",
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
  { path: "/contributes", content: <ContributePage />, parent: "/submit" },
  {
    path: "/track",
    content: <TrackSubmission />,

    parent: "/more",
  },
  {
    path: "/submissionSummary",
    content: <SubmissionSummaryPage />,
    parent: "/track",
  },
  {
    path: "/dashboard/:section?",
    content: <AdminDashboard />,
    parent: "/more",
  },
  {
    path: "/docs/:article?",
    content: <DocsPage />,
    parent: "/more",
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
