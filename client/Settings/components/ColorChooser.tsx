import * as React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { Button } from "../../Components/Button";
import { ColorBlock } from "./ColorBlock";

interface ColorChooserProps {
    currentStyles: PlayerViewCustomStyles;
    updateStyle: (name: keyof PlayerViewCustomStyles, value: string) => void;
}
interface ColorChooserState {
    styles: PlayerViewCustomStyles;
    selectedStyle: keyof PlayerViewCustomStyles | null;
}

export class ColorChooser extends React.Component<ColorChooserProps, ColorChooserState> {
    constructor(props) {
        super(props);
        this.state = {
            styles: this.props.currentStyles,
            selectedStyle: null
        };
    }

    private handleChangeComplete = (color: ColorResult) => {
        const updatedState = {
            styles: { ...this.state.styles, [this.state.selectedStyle]: color.hex }
        };

        this.setState(updatedState);
        this.props.updateStyle(this.state.selectedStyle, color.hex);
    }

    private bindClickToSelectStyle(style: keyof PlayerViewCustomStyles) {
        return () => this.setState({ selectedStyle: style });
    }

    private clearSelectedStyle = () => {
        const updatedState = {
            styles: { ...this.state.styles, [this.state.selectedStyle]: "" }
        };

        this.setState(updatedState);
        this.props.updateStyle(this.state.selectedStyle, "");
    }

    public render() {
        return <div className="c-color-chooser">
            <div>
                <h4>Colors</h4>
                <p>Combatant Text: <ColorBlock color={this.state.styles.combatantText} click={this.bindClickToSelectStyle("combatantText")} /></p>
                <p>Background: <ColorBlock color={this.state.styles.combatantBackground} click={this.bindClickToSelectStyle("combatantBackground")} /></p>
                <p>Header Text: <ColorBlock color={this.state.styles.headerText} click={this.bindClickToSelectStyle("headerText")} /></p>
                <p>Background: <ColorBlock color={this.state.styles.headerBackground} click={this.bindClickToSelectStyle("headerBackground")} /></p>
                <p>Main Background: <ColorBlock color={this.state.styles.mainBackground} click={this.bindClickToSelectStyle("mainBackground")} /></p>
            </div>
            {
                this.state.selectedStyle !== null &&
                <div>
                    <SketchPicker width="210px" color={this.state.styles[this.state.selectedStyle]} onChangeComplete={this.handleChangeComplete} />
                    <Button text="Clear" onClick={this.clearSelectedStyle} />
                </div>
            }
        </div>;
    }
}