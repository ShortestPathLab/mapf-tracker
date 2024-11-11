import { DetailsList } from "components/DetailsList";
import { useRequestData } from "queries/useRequestQuery";

export const SubmissionRequestGlance = ({
  apiKey,
}: {
  apiKey?: string | number;
}) => {
  const { data: request } = useRequestData(apiKey);
  return (
    <DetailsList
      sx={{ m: -2 }}
      items={[
        { label: "Algorithm", value: request?.algorithmName },
        { label: "API key", value: `${apiKey}` },
      ]}
    />
  );
};
