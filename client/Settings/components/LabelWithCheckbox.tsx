import * as React from "react";
import { probablyUniqueString } from "../../../common/Toolbox";

interface LabelWithCheckboxProps {
  text: string;
  checked: boolean;
  toggle: (newState: boolean) => void;
}

interface State {
  checked: boolean;
}

export class LabelWithCheckbox extends React.Component<
  LabelWithCheckboxProps,
  State
> {
  private id: string;

  public componentWillMount() {
    this.id = `toggle_${probablyUniqueString()}`;
  }

  constructor(props: LabelWithCheckboxProps) {
    super(props);

    this.state = {
      checked: props.checked
    };
  }

  public render() {
    return (
      <p>
        <label className="c-checkbox-label" htmlFor={this.id}>
          {this.props.text}
        </label>
        <input
          id={this.id}
          type="checkbox"
          checked={this.state.checked}
          onChange={this.onChange}
        />
      </p>
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.toggle(e.currentTarget.checked);
    this.setState({ checked: e.currentTarget.checked });
  };
}
