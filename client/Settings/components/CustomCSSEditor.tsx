import * as React from "react";
import { ChangeEvent } from "react";
import { SketchPicker, ColorResult } from "react-color";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { ColorChooser } from "./ColorChooser";

export interface CustomCSSEditorProps {
    currentCSS: string;
    currentStyles: PlayerViewCustomStyles;
    updateCSS: (css: string) => void;
    updateStyle: (name: keyof PlayerViewCustomStyles, value: string) => void;
}

interface State {
    manualCSS: string;
}

export class CustomCSSEditor extends React.Component<CustomCSSEditorProps, State> {
    constructor(props: CustomCSSEditorProps) {
        super(props);
        this.state = {
            manualCSS: this.props.currentCSS
        };
    }

    private updateCSS = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ manualCSS: event.target.value });
        this.props.updateCSS(event.target.value);
    }

    public render() {
        return <div className="custom-css-editor">
            <p>Epic Initiative is enabled.</p>
            <ColorChooser currentStyles={this.props.currentStyles} updateStyle={this.props.updateStyle} />
            <h4>Additional CSS</h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.props.currentCSS} />
        </div>;
    }
}

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