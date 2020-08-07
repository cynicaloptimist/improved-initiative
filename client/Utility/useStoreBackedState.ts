import { useState, useEffect } from "react";
import { Store } from "./Store";

export function useStoreBackedState<T>(
  listName: string,
  key: string,
  defaultValue: T
): [T, (newValue: T) => void] {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    Store.Load<T>(listName, key).then(value => setValue(value));
  }, [listName, key]);

  const setValueWithStore = (newValue: T) => {
    Store.Save(listName, key, newValue);
    setValue(newValue);
  };

  return [value, setValueWithStore];
}
