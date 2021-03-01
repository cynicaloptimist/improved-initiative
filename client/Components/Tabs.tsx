import * as React from "react";

export function Tabs<T>(props: {
  options: T[];
  selected?: T;
  onChoose: (option: T) => void;
}) {
  const buttonElements = props.options.map((option, i) => (
    <button
      type="button"
      key={i}
      className={props.selected == option ? "c-tab s-selected" : "c-tab"}
      onClick={() => props.onChoose(option)}
    >
      {option}
    </button>
  ));

  return <div className="c-tabs">{buttonElements}</div>;
}
