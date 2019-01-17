import * as React from "react";

interface TabsProps {
  options: string[];
  selected?: string;
  onChoose: (option: string) => void;
}

interface TabsState {}

export class Tabs extends React.Component<TabsProps, TabsState> {
  public render() {
    const spanElements = this.props.options.map((option, i) => (
      <button
        type="button"
        key={i}
        className={this.props.selected == option ? "c-tab s-selected" : "c-tab"}
        onClick={() => this.props.onChoose(option)}
      >
        {option}
      </button>
    ));

    return <div className="c-tabs">{spanElements}</div>;
  }
}
