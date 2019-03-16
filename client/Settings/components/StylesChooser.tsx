import { Field, FieldProps } from "formik";
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
  selectedStyle: keyof PlayerViewCustomStyles;
}

export class StylesChooser extends React.Component<
  ColorChooserProps,
  ColorChooserState
> {
  constructor(props) {
    super(props);
    this.state = {
      styles: this.props.currentStyles,
      selectedStyle: "combatantText"
    };
  }

  private handleChangeComplete = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb;
    const colorString = `rgba(${r},${g},${b},${a})`;
    const updatedState = {
      styles: { ...this.state.styles, [this.state.selectedStyle]: colorString }
    };

    this.setState(updatedState);
    this.props.updateStyle(this.state.selectedStyle, colorString);
  };

  private bindClickToSelectStyle(style: keyof PlayerViewCustomStyles) {
    return () => this.setState({ selectedStyle: style });
  }

  private clearSelectedStyle = () => {
    const updatedState = {
      styles: { ...this.state.styles, [this.state.selectedStyle]: "" }
    };

    this.setState(updatedState);
    this.props.updateStyle(this.state.selectedStyle, "");
  };

  private getLabelAndColorBlock(
    label: string,
    style: keyof PlayerViewCustomStyles
  ) {
    return (
      <p>
        {label}:{" "}
        <ColorBlock
          color={this.state.styles[style]}
          click={this.bindClickToSelectStyle(style)}
          selected={this.state.selectedStyle == style}
        />
      </p>
    );
  }

  public render() {
    return (
      <div className="c-styles-chooser">
        <div className="c-styles-chooser-inputs">
          <h4>Colors</h4>
          {this.getLabelAndColorBlock("Combatant Text", "combatantText")}
          {this.getLabelAndColorBlock(
            "Combatant Background",
            "combatantBackground"
          )}
          {this.getLabelAndColorBlock(
            "Active Combatant Indicator",
            "activeCombatantIndicator"
          )}
          {this.getLabelAndColorBlock("Header Text", "headerText")}
          {this.getLabelAndColorBlock("Header Background", "headerBackground")}
          {this.getLabelAndColorBlock("Main Background", "mainBackground")}
          <h4>Other Styles</h4>
          <Field name="PlayerView.CustomStyles.font">
            {(fieldProps: FieldProps) => (
              <p>
                <span style={{ fontFamily: fieldProps.field.value }}>
                  Font:
                </span>{" "}
                <input {...fieldProps.field} />
              </p>
            )}
          </Field>

          <p>
            Background Image URL:{" "}
            <Field name="PlayerView.CustomStyles.backgroundUrl" />
          </p>
        </div>
        {this.state.selectedStyle !== null && (
          <div className="c-styles-chooser-color-wheel">
            <SketchPicker
              width="210px"
              color={this.state.styles[this.state.selectedStyle]}
              onChangeComplete={this.handleChangeComplete}
            />
            <Button text="Clear" onClick={this.clearSelectedStyle} />
          </div>
        )}
      </div>
    );
  }
}
