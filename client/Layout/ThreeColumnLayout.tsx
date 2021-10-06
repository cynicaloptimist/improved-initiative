import * as React from "react";
import { TrackerViewModel } from "../TrackerViewModel";
import { VerticalResizer } from "./VerticalResizer";
import { useStoreBackedState } from "../Utility/useStoreBackedState";
import { Store } from "../Utility/Store";
import { CenterColumn } from "./CenterColumn";
import { ToolbarHost } from "./ToolbarHost";
import { LeftColumn } from "./LeftColumn";
import { RightColumn } from "./RightColumn";
import { LegacySynchronousLocalStore } from "../Utility/LegacySynchronousLocalStore";

export function ThreeColumnLayout(props: { tracker: TrackerViewModel }) {
  const [leftColumnWidth, setLeftColumnWidth] = useStoreBackedState(
    LegacySynchronousLocalStore.User,
    "columnWidth",
    375
  );
  const [rightColumnWidth, setRightColumnWidth] = useStoreBackedState(
    LegacySynchronousLocalStore.User,
    "rightColumnWidth",
    375
  );

  return (
    <>
      <ToolbarHost tracker={props.tracker} />
      <LeftColumn tracker={props.tracker} columnWidth={leftColumnWidth} />
      <VerticalResizer
        adjustWidth={offset => setLeftColumnWidth(leftColumnWidth + offset)}
      />
      <CenterColumn tracker={props.tracker} />
      <VerticalResizer
        adjustWidth={offset => setRightColumnWidth(rightColumnWidth - offset)}
      />
      <RightColumn tracker={props.tracker} columnWidth={rightColumnWidth} />
    </>
  );
}
