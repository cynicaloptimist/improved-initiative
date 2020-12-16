import * as React from "react";
import { TrackerViewModel } from "./TrackerViewModel";
import { VerticalResizer } from "./Layout/VerticalResizer";
import { useStoreBackedState } from "./Utility/useStoreBackedState";
import { Store } from "./Utility/Store";
import { CenterColumn } from "./Layout/CenterColumn";
import { ToolbarHost } from "./Layout/ToolbarHost";
import { LeftColumn } from "./Layout/LeftColumn";
import { RightColumn } from "./Layout/RightColumn";

export function ThreeColumnLayout(props: { tracker: TrackerViewModel; }) {
  const [columnWidth, setColumnWidth] = useStoreBackedState(
    Store.User,
    "columnWidth",
    375
  );

  return (
    <>
      <ToolbarHost tracker={props.tracker} />
      <LeftColumn tracker={props.tracker} columnWidth={columnWidth} />

      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth + offset)} />
      <CenterColumn tracker={props.tracker} />
      <VerticalResizer
        adjustWidth={offset => setColumnWidth(columnWidth - offset)} />
      <RightColumn tracker={props.tracker} columnWidth={columnWidth} />
    </>
  );
}
