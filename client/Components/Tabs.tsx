import * as React from "react";

interface TabsProps<T> {
  options: T[];
  selected?: T;
  onChoose: (option: T) => void;
}

interface TabsState {}

export class Tabs<T> extends React.Component<TabsProps<T>, TabsState> {
  public render() {
    const buttonElements = this.props.options.map((option, i) => (
      <button
        type="button"
        key={i}
        className={this.props.selected == option ? "c-tab s-selected" : "c-tab"}
        onClick={() => this.props.onChoose(option)}
      >
        {option}
      </button>
    ));

    return <div className="c-tabs">{buttonElements}</div>;
  }
}
