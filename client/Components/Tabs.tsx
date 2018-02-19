import * as React from "react";

interface TabsProps {
    options: string[];
    selected?: string;
    onChoose: (option: string) => void;
}

interface TabsState { }

export class Tabs extends React.Component<TabsProps, TabsState> {
    public render() {
        const spanElements = this.props.options.map(
            (option, i) => <span key={i} className={this.props.selected == option ? "s-selected" : ""} onClick={() => this.props.onChoose(option)}>{option}</span>
        );

        return <div className="c-tabs">
            {spanElements}
        </div>;
    }
}