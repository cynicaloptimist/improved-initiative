import * as React from "react";
import { useDrag } from "react-dnd";

export function VerticalResizer(props: {
  adjustWidth: (widthOffset: number) => void;
}) {
  const [collectedProps, drag] = useDrag({
    item: { type: "vertical-resizer", originalClientX: 0 },
    begin: monitor => {
      return {
        type: "vertical-resizer",
        originalClientX: monitor.getInitialSourceClientOffset().x
      };
    },
    end: (item, monitor) => {
      const difference = monitor.getDifferenceFromInitialOffset();
      if (difference) {
        props.adjustWidth(difference.x);
      } else {
        const result = monitor.getDropResult();
        if (result) {
          props.adjustWidth(result.finalClientX - item.originalClientX);
        }
      }
    }
  });

  return <div ref={drag} className={"vertical-resizer"} />;
}

import { useDrop } from "react-dnd";

export function useVerticalResizerDrop() {
  const [, drop] = useDrop({
    accept: "vertical-resizer",
    drop: (item, monitor) => {
      return {
        finalClientX: monitor.getClientOffset().x
      };
    }
  });

  return drop;
}
