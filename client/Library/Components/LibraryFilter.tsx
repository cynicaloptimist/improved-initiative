import * as React from "react";
import { useRef, useCallback } from "react";
import { useEffect } from "react";

interface LibraryFilterProps {
  applyFilterFn: (filter: string) => void;
}

export function LibraryFilter(props: LibraryFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current.focus();
  }, [inputRef]);

  const applyFilter = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const filterValue = event.currentTarget.value.toLocaleLowerCase();
      setImmediate(() => props.applyFilterFn(filterValue));
    },
    [props.applyFilterFn]
  );

  return (
    <input
      className="filter-library"
      placeholder="Filter..."
      onChange={applyFilter}
      ref={inputRef}
    />
  );
}
