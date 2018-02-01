import * as React from "react";
import { ChangeEvent } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { StylesChooser } from "./StylesChooser";

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
            <StylesChooser currentStyles={this.props.currentStyles} updateStyle={this.props.updateStyle} />
            <h4>Additional CSS</h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.props.currentCSS} />
        </div>;
    }
}
