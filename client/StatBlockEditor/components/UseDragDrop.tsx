import React = require("react");
import { useDrop } from "react-dnd";

interface DraggedField {
  type: string;
  index: number;
}

export function DropZone(props: {
  dragDropType: string;
  index: number;
  move: (from: number, to: number) => void;
}) {
  const { dragDropType, index, move } = props;
  const [collectedProps, drop] = useDrop({
    accept: dragDropType,
    canDrop: item => {
      return index < item.index || index > item.index + 1;
    },
    drop: (item: DraggedField) => {
      const from = item.index;
      const to = index;
      if (to > from) {
        move(from, to - 1);
      } else {
        move(from, to);
      }
    },
    collect: monitor => {
      console.log(
        "collecting: dropzone",
        index,
        monitor.getItemType(),
        monitor.getItem() && monitor.getItem().index,
        "isOver",
        monitor.isOver(),
        "canDrop",
        monitor.canDrop()
      );
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      };
    }
  });

  let className = "drop-zone";
  if (collectedProps.isOver) {
    className += "--is-over";
  }
  if (collectedProps.canDrop) {
    className += "--can-drop";
  }
  return <div className={className} ref={drop} />;
}
