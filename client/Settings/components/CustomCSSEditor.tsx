import * as React from "react";
import { ChangeEvent } from "react";
import { SketchPicker, ColorResult } from "react-color";
import { PlayerViewCustomStyles } from "../Settings";

export interface CustomCSSEditorProps {
    currentCSS: string;
    currentStyles: PlayerViewCustomStyles;
    updateCSS: (css: string) => void;
    updateStyle: (name: keyof PlayerViewCustomStyles, value: string) => void;
}

interface State {
    manualCSS: string;
    combatantTextColor: string;
}

export class CustomCSSEditor extends React.Component<CustomCSSEditorProps, State> {
    constructor(props: CustomCSSEditorProps) {
        super(props);
        this.state = {
            manualCSS: "",
            combatantTextColor: "",
        };
    }

    private updateCSS = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ manualCSS: event.target.value });
        this.props.updateCSS(event.target.value);
    }

    private handleChangeComplete = (color: ColorResult) => {
        this.setState({
            combatantTextColor: color.hex
        });
    }

    public render() {
        return <div className="custom-css-editor">
            <p>Epic Initiative is enabled.</p>
            <h4>Colors</h4>
            <p>Combatant Text: <ColorBlock color={this.state.combatantTextColor} /></p>
            <SketchPicker width="210px" />
            <h4>Additional CSS</h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.props.currentCSS} />
        </div>;
    }
}

class ColorBlock extends React.Component<{ color: string }, {}> {
    constructor(props) {
        super(props);
    }
    public render() {
        const style = {
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "1px black solid",
            backgroundColor: this.props.color
        };
        return <span style={style} />;
    }
}