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

  private getLabelAndColorBlock(
    label: string,
    style: keyof PlayerViewCustomStyles
  ) {
    return (
      <Field name={"PlayerView.CustomStyles." + style}>
        {(fieldProps: FieldProps) => (
          <p>
            {label}:{" "}
            <ColorBlock
              color={fieldProps.field.value}
              click={this.bindClickToSelectStyle(style)}
              selected={this.state.selectedStyle == style}
            />
          </p>
        )}
      </Field>
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
          <Field name={"PlayerView.CustomStyles." + this.state.selectedStyle}>
            {(fieldProps: FieldProps) => (
              <div className="c-styles-chooser-color-wheel">
                <SketchPicker
                  width="210px"
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
        )}
      </div>
    );
  }
}
