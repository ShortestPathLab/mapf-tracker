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
import SudoPage from "./pages/admin-dashboard";
import Submissions from "./pages/algorithms";
import DocsPage from "./pages/docs";
import TrackSubmission from "./pages/submissions";
import Visualiser from "./pages/visualiser";

function MorePage() {
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
type NestedRoute = Omit<Route, "parent"> & {
  children?: NestedRoute[];
};

const flattenRoutes = (routes: NestedRoute[], parent?: string): Route[] => {
  return routes.flatMap(({ children, ...route }) => {
    const flatRoute: Route = parent ? { ...route, parent } : route;
    return [
      flatRoute,
      ...(children ? flattenRoutes(children, route.path) : []),
    ];
  });
};

const nestedRoutes: NestedRoute[] = [
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
    path: "/benchmarks",
    content: <BenchmarksRootLevelPage />,
    children: [
      {
        path: "/scenarios",
        content: <BenchmarksMapLevelPage />,
        children: [
          {
            path: "/instances",
            content: <BenchmarksScenarioLevelPage />,
            children: [{ path: "/visualization", content: <Visualiser /> }],
          },
        ],
      },
    ],
  },
  {
    path: "/submissions",
    content: <Submissions />,
    children: [{ path: "/submissions/:id", content: <AlgorithmPage /> }],
  },
  {
    path: "/more",
    content: <MorePage />,
    children: [
      { path: "/submit/:section?", content: <MakeASubmissionPage /> },
      {
        path: "/track",
        content: <TrackSubmission />,
        children: [{ path: "/upload", content: <SubmissionSummaryPage /> }],
      },
      { path: "/sudo/:section?", content: <SudoPage /> },
      { path: "/docs/:article?", content: <DocsPage /> },
    ],
  },
];

export const routes: Route[] = flattenRoutes(nestedRoutes);
