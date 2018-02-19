import * as React from "react";

interface ColorBlockProps {
    color: string;
    selected: boolean;
    click: () => void;
}

export class ColorBlock extends React.Component<ColorBlockProps, {}> {
    public render() {
        const style = {
            backgroundColor: this.props.color
        };

        let className = "c-color-block";
        if (this.props.selected) {
            className += " s-selected";
        }
        return <span className={className} style={style} onClick={this.props.click} />;
    }
}