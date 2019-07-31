import { Field } from "formik";
import * as React from "react";
import { ModifierLists, StatBlock } from "../../../common/StatBlock";
import { DieFreeFormula, Formula } from "../../Rules/Formulas/Formula";
import { FormApi } from "../StatBlockEditor";

interface NameAndComputedModifierFieldProps {
  remove: (index: number) => void;
  modifierType: keyof ModifierLists;
  index: number;
  api: FormApi;
}
interface NameAndComputedModifierFieldState {
  ModifierResult: string;
}

export class NameAndComputedModifierField extends React.Component<
  NameAndComputedModifierFieldProps,
  NameAndComputedModifierFieldState
> {
  private nameInput: HTMLInputElement;

  public state: NameAndComputedModifierFieldState = {
    ModifierResult: ""
  };

  public componentDidMount() {
    if (this.nameInput.value == "") {
      this.nameInput.focus();
    }
    this.recalculate();
  }

  private recalculate() {
    const modifier = this.props.api.values[this.props.modifierType][
      this.props.index
    ];
    let ModifierResult: string;
    if (!modifier || !modifier.ModifierFormula) {
      ModifierResult = "";
    } else if (DieFreeFormula.WholeStringMatch.test(modifier.ModifierFormula)) {
      const formula = new DieFreeFormula(modifier.ModifierFormula);
      ModifierResult = formula
        .EvaluateStatic(this.props.api.values)
        .Total.toString();
    } else {
      ModifierResult = "syntax error";
    }
    this.setState({ ModifierResult });
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
          onBlur={() => this.recalculate()}
          name={`${this.props.modifierType}[${
            this.props.index
          }].ModifierFormula`}
        />
        <span>=</span>
        <input
          type="text"
          readOnly
          disabled
          value={this.state.ModifierResult}
        />
        <span
          className="fa-clickable fa-trash"
          onClick={() => this.props.remove(this.props.index)}
        />
      </div>
    );
  }
}
