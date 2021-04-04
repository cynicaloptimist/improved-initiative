import { useCallback, useState } from "react";
import React = require("react");

export type SelectionContext<T> = {
  selected: T[];
  setSelected: (val: T) => void;
  addSelected: (val: T) => void;
  clearSelected: () => void;
};

export const SelectionContext = React.createContext<SelectionContext<any>>({
  selected: [],
  setSelected: () => {},
  addSelected: () => {},
  clearSelected: () => {}
});

export function useSelection<T>() {
  const [selected, setSelectedItems] = useState<T[]>([]);
  const setSelected = useCallback(
    (selected: T) => {
      setSelectedItems([selected]);
    },
    [setSelectedItems]
  );
  const addSelected = useCallback(
    (newSelected: T) => {
      if (!selected.includes(newSelected)) {
        setSelectedItems([...selected, newSelected]);
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
    clearSelected,
  };
}
