import {
  useDrag,
  useDrop,
  DragElementWrapper,
  DragSourceOptions
} from "react-dnd";

interface DraggedField {
  type: string;
  index: number;
}

export const useDragDrop = function(
  dragDropType: string,
  index: number,
  move: (from: number, to: number) => void
): [DragElementWrapper<DragSourceOptions>, DragElementWrapper<DraggedField>] {
  const [, drag] = useDrag({
    item: { index: index, type: dragDropType }
  });

  const [, drop] = useDrop({
    accept: dragDropType,
    drop: (item: DraggedField) => {
      const from = item.index;
      const to = index;
      console.log("from", item.index, "to", to);
      if (to > from) {
        move(from, to - 1);
      } else {
        move(from, to);
      }
    }
  });

  return [drag, drop];
};
