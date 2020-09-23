import * as React from "react";
import { useDrag } from "react-dnd";

export function VerticalResizer(props: {
  adjustWidth: (widthOffset: number) => void;
}) {
  const [collectedProps, drag] = useDrag({
    item: { type: "vertical-resizer" },
    collect: monitor => {
      return {
        dragActive: monitor.isDragging()
      };
    },
    end: (_, monitor) => {
      props.adjustWidth(monitor.getDifferenceFromInitialOffset().x);
    }
  });

  return (
    <div
      ref={drag}
      className={
        "vertical-resizer" + (collectedProps.dragActive ? " drag-active" : "")
      }
    />
  );
}
