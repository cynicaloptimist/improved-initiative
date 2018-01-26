import * as React from "react";
import { ChangeEvent } from "react";
import { SketchPicker } from "react-color";

interface CustomCSSEditorProps {
    currentCSS: string;
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
            <textarea rows={10} onChange={this.updateCSS} value={this.props.currentCSS} />
            <SketchPicker />
        </div>;
    }
}