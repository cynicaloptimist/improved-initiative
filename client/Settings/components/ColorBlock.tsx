import * as React from "react";

export class ColorBlock extends React.Component<{ color: string, click: () => void }, {}> {
    constructor(props) {
        super(props);
    }
    public render() {
        const style = {
            backgroundColor: this.props.color
        };
        return <span className="c-colorBlock" style={style} onClick={this.props.click} />;
    }
}