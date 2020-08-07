import * as React from "react";
import { useState } from "react";
export function VerticalResizer(props: {
  adjustWidth: (widthOffset: number) => void;
}) {
  const [dragStart, setDragStart] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  return (
    <div
      className={"vertical-resizer" + (dragActive ? " drag-active" : "")}
      draggable
      onDragStart={e => {
        setDragStart(e.clientX);
        setDragActive(true);
      }}
      onDragEnd={e => {
        const horizontalOffset = e.clientX - dragStart;
        props.adjustWidth(horizontalOffset);
        setDragActive(false);
      }} />
  );
}
