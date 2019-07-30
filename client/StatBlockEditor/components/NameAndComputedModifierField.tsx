import { Field } from "formik";
import * as React from "react";
import { StatBlock } from "../../../common/StatBlock";
import { DieFreeFormula, Formula } from "../../Rules/Formulas/Formula";

interface NameAndComputedModifierFieldProps {
  remove: (index: number) => void;
  modifierType: string;
  index: number;
  statBlock: StatBlock;
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
    // I feel like this is betraying the goals of Formik by just manually grabbing the data in such a messy way...
    const expression = this.props.statBlock[this.props.modifierType][
      this.props.index
    ].ModifierFormula;
    let result: string;
    if (!expression) {
      result = "";
    } else if (DieFreeFormula.WholeStringMatch.test(expression)) {
      const formula = new DieFreeFormula(expression);
      result = formula.EvaluateStatic(this.props.statBlock).Total.toString();
    } else {
      result = "error";
    }
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
        <input type="text" readOnly disabled value={"= " + result} />
        <span
          className="fa-clickable fa-trash"
          onClick={() => this.props.remove(this.props.index)}
        />
      </div>
    );
  }
}
