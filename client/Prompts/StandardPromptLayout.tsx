import React = require("react");
import { SubmitButton } from "../Components/Button";

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fieldsDoSubmit?: boolean;
};

export function StandardPromptLayout(props: Props) {
  const classNames = ("p-standard-prompt" + " " + props.className).trim();

  if (props.fieldsDoSubmit) {
    return (
      <div className={classNames}>
        <label>
          <div className="p-standard-prompt__label">{props.label}</div>
        </label>
        <div className="p-standard-prompt__fields">{props.children}</div>
      </div>
    );
  }
  return (
    <div className={classNames}>
      <label>
        <div className="p-standard-prompt__label">{props.label}</div>
        <div className="p-standard-prompt__fields">{props.children}</div>
      </label>
      <SubmitButton />
    </div>
  );
}
