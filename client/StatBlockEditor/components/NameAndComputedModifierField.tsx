import { Field } from "formik";
import * as React from "react";

interface NameAndComputedModifierFieldProps {
  remove: (index: number) => void;
  modifierType: string;
  index: number;
}
interface NameAndComputedModifierFieldState {}

export class NameAndComputedModifierField extends React.Component<
  NameAndComputedModifierFieldProps,
  NameAndComputedModifierFieldState
> {
  private nameInput: HTMLInputElement;

  public componentDidMount() {
    if (this.nameInput.value == "") {
      this.nameInput.focus();
    }
  }

  public render() {
    return (
      <div>
        <Field
          type="text"
          className="name"
          name={`${this.props.modifierType}[${this.props.index}].Name`}
          innerRef={f => (this.nameInput = f)}
        />
        <Field
          type="text"
          className="modifierFormula"
          name={`${this.props.modifierType}[${
            this.props.index
          }].ModifierFormula`}
        />
        <input type="text" className="computedModifier" value="0" />
        <span
          className="fa-clickable fa-trash"
          onClick={() => this.props.remove(this.props.index)}
        />
      </div>
    );
  }
}
