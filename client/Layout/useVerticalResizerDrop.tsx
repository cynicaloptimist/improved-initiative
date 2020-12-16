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
