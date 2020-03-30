import React = require("react");
import { SubmitButton } from "../../Components/Button";

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noSubmit?: boolean;
};

export function StandardPromptLayout(props: Props) {
  const classNames = ("p-standard-prompt" + " " + props.className).trim();
  return (
    <div className={classNames}>
      <label>
        <div className="p-standard-prompt__label">{props.label}</div>
        <div className="p-standard-prompt__fields">{props.children}</div>
      </label>
      {props.noSubmit || <SubmitButton />}
    </div>
  );
}
