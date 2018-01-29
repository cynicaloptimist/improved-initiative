import * as React from "react";

export class ColorBlock extends React.Component<{ color: string, click: () => void }, {}> {
    constructor(props) {
        super(props);
    }
    public render() {
        const style = {
            display: "inline-block",
            width: "18px",
            height: "18px",
            border: "1px black solid",
            verticalAlign: "middle",
            backgroundColor: this.props.color
        };
        return <span style={style} onClick={this.props.click} />;
    }
}