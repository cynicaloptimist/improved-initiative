import { useEffect, useRef } from "react";

export function useFocusIfEmpty() {
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (nameInput.current && nameInput.current.value == "") {
      nameInput.current.focus();
    }
  }, []);
  return nameInput;
}
