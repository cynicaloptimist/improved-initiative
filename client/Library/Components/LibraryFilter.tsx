import * as React from "react";

interface LibraryFilterProps {
  applyFilterFn: (filter: string) => void;
}

export class LibraryFilter extends React.Component<LibraryFilterProps> {
  private inputElement: HTMLInputElement;

  public render() {
    const applyFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.props.applyFilterFn(event.currentTarget.value.toLocaleLowerCase());
    };

    return (
      <input
        className="filter-library"
        placeholder="Filter..."
        onChange={applyFilter}
        ref={e => (this.inputElement = e)}
      />
    );
  }

  public componentDidMount = () => {
    this.inputElement.focus();
  };
}
