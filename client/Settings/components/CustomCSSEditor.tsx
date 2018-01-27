import * as React from "react";
import { ChangeEvent } from "react";
import { SketchPicker } from "react-color";
import { PlayerViewCustomStyles } from "../Settings";

interface CustomCSSEditorProps {
    currentCSS: string;
    currentStyles: PlayerViewCustomStyles;
    updateCurrentCSS: (css: string) => void;
}

interface State {
    manualCSS: string;
}

export class CustomCSSEditor extends React.Component<CustomCSSEditorProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            manualCSS: props.currentCSS
        };
    }

    private updateCSS = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ manualCSS: event.target.value });
        this.props.updateCurrentCSS(event.target.value);
    }

    public render() {
        return <div className="custom-css-editor">
            <p>Epic Initiative is enabled.</p>
            <h4>Colors</h4>
            <SketchPicker width="210px" />
            <h4>Additional CSS</h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.props.currentCSS} />
        </div>;
    }
}