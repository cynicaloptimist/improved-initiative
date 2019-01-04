import * as React from "react";

interface LibraryFilterProps {
  applyFilterFn: (filter: string) => void;
}

export class LibraryFilter extends React.Component<LibraryFilterProps> {
  public render() {
    const applyFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.props.applyFilterFn(event.currentTarget.value.toLocaleLowerCase());
    };

    return (
      <input
        className="filter-library"
        placeholder="Filter..."
        onChange={applyFilter}
      />
    );
  }
}
