import * as React from "react";
import { useState } from "react";
import { useCallback } from "react";
export function VerticalResizer(props: {
  adjustWidth: (widthOffset: number) => void;
}) {
  const [dragStart, setDragStart] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const dragEnd = useCallback(
    e => {
      const horizontalOffset = e.clientX - dragStart;
      props.adjustWidth(horizontalOffset);
      setDragActive(false);
    },
    [dragStart, props.adjustWidth, setDragActive]
  );

  return (
    <div
      className={"vertical-resizer" + (dragActive ? " drag-active" : "")}
      draggable
      onDragStart={e => {
        setDragStart(e.clientX);
        setDragActive(true);
      }}
      onDragEnd={dragEnd}
    />
  );
}
