import { Field, FieldProps } from "formik";
import * as React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { Button } from "../../Components/Button";
import { ColorBlock } from "./ColorBlock";

interface ColorChooserProps {}
interface ColorChooserState {
  selectedStyle: keyof PlayerViewCustomStyles;
}

export class StylesChooser extends React.Component<
  ColorChooserProps,
  ColorChooserState
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedStyle: "combatantText"
    };
  }

  public render() {
    return (
      <div className="c-styles-chooser-colors">
        <div className="c-styles-chooser-slot-chooser">
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
        </div>
        <Field name={"PlayerView.CustomStyles." + this.state.selectedStyle}>
          {(fieldProps: FieldProps) => (
            <div className="c-styles-chooser-color-wheel">
              <SketchPicker
                presetColors={[]}
                color={fieldProps.field.value}
                onChangeComplete={color =>
                  this.handleChangeComplete(color, fieldProps)
                }
              />
              <Button
                text="Clear"
                onClick={() => this.clearSelectedStyle(fieldProps)}
              />
            </div>
          )}
        </Field>
      </div>
    );
  }

  private getLabelAndColorBlock(
    label: string,
    style: keyof PlayerViewCustomStyles
  ) {
    return (
      <Field name={"PlayerView.CustomStyles." + style}>
        {(fieldProps: FieldProps) => (
          <div
            className="c-label-and-color-block"
            onClick={this.bindClickToSelectStyle(style)}
          >
            <span>{label}</span>
            <ColorBlock
              color={fieldProps.field.value}
              click={this.bindClickToSelectStyle(style)}
              selected={this.state.selectedStyle == style}
            />
          </div>
        )}
      </Field>
    );
  }

  private handleChangeComplete = (
    color: ColorResult,
    fieldProps: FieldProps
  ) => {
    const { r, g, b, a } = color.rgb;
    const colorString = `rgba(${r},${g},${b},${a})`;
    const fieldName = "PlayerView.CustomStyles." + this.state.selectedStyle;
    fieldProps.form.setFieldValue(fieldName, colorString);
  };

  private bindClickToSelectStyle(style: keyof PlayerViewCustomStyles) {
    return () => this.setState({ selectedStyle: style });
  }

  private clearSelectedStyle = (fieldProps: FieldProps) => {
    const fieldName = "PlayerView.CustomStyles." + this.state.selectedStyle;
    fieldProps.form.setFieldValue(fieldName, "");
  };
}
