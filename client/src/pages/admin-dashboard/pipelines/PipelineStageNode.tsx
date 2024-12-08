import { Card } from "@mui/material";
import TouchRipple, {
  TouchRippleActions,
} from "@mui/material/ButtonBase/TouchRipple";
import { Handle, Position } from "@xyflow/react";
import { useDialog } from "hooks/useDialog";
import { SyntheticEvent, useRef } from "react";
import { StageStatus } from "./StageStatus";
import { StageStatusDialog } from "./StageStatusDialog";

export const useRipple = () => {
  const rippleRef = useRef<TouchRippleActions | null>(null);
  const start = (e: SyntheticEvent) =>
    rippleRef?.current?.start(e, { center: false });

  const stop = () => rippleRef.current?.stop();
  return {
    start,
    stop,
    bindCapture: {
      tabIndex: 0,
      onMouseDownCapture: start,
      onTouchStartCapture: start,
      onMouseUpCapture: stop,
      onTouchEndCapture: stop,
      onMouseOutCapture: stop,
      onTouchCancelCapture: stop,
    },
    ripple: <TouchRipple ref={rippleRef} center />,
  };
};

export function PipelineStageNode({
  data: { stage } = {},
}: {
  data?: { stage?: string };
}) {
  const { dialog, open } = useDialog(StageStatusDialog, {
    title: "Stage details",
    padded: true,
  });
  const { ripple, bindCapture } = useRipple();
  return (
    <>
      <Card
        {...bindCapture}
        sx={{
          minWidth: 320,
          bgcolor: "background.paper",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
        onClick={() => open({ stage })}
      >
        <Handle type="target" position={Position.Left} />
        <StageStatus stage={stage} />
        <Handle type="source" position={Position.Right} />
        {ripple}
      </Card>
      {dialog}
    </>
  );
}
