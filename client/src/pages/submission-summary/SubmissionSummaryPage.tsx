import { useLocationState } from "hooks/useNavigation";
import { SubmissionLocationState } from "pages/submissions/SubmissionLocationState";
import SubmissionSummary from "./SubmissionSummary";

export default function SubmissionSummaryPage() {
  const { apiKey } = useLocationState<SubmissionLocationState>();
  return <SubmissionSummary apiKey={apiKey} />;
}
