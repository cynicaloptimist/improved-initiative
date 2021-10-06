import _ = require("lodash");
import { useCallback, useState } from "react";
import React = require("react");

export type Selection<T> = {
  selected: T[];
  setSelected: (val: T) => void;
  addSelected: (val: T) => void;
  removeSelected: (val: T) => void;
  clearSelected: () => void;
};

export const SelectionContext = React.createContext<Selection<any>>({
  selected: [],
  setSelected: () => {},
  addSelected: () => {},
  removeSelected: () => {},
  clearSelected: () => {}
});

export function useSelection<T>(): Selection<T> {
  const [selected, setSelectedItems] = useState<T[]>([]);

  const setSelected = useCallback(
    (targetItems: T) => {
      setSelectedItems([targetItems]);
    },
    [setSelectedItems]
  );

  const addSelected = useCallback(
    (targetItem: T) => {
      if (!selected.includes(targetItem)) {
        setSelectedItems(oldSelected => [...oldSelected, targetItem]);
      }
    },
    [selected, setSelectedItems]
  );

  const removeSelected = useCallback(
    (targetItem: T) => {
      if (selected.includes(targetItem)) {
        setSelectedItems(oldSelected =>
          oldSelected.filter(s => s !== targetItem)
        );
      }
    },
    [selected, setSelectedItems]
  );

  const clearSelected = useCallback(() => {
    setSelectedItems([]);
  }, [setSelectedItems]);

  return {
    selected,
    setSelected,
    addSelected,
    removeSelected,
    clearSelected
  };
}
