import * as React from "react";

export function Tabs<T extends string>(props: {
  optionNamesById: Record<T, string>;
  selected?: T;
  onChoose: (option: T) => void;
}) {
  const buttonElements = Object.keys(props.optionNamesById).map((key: T, i) => (
    <button
      type="button"
      key={key}
      className={props.selected == key ? "c-tab s-selected" : "c-tab"}
      onClick={() => props.onChoose(key)}
    >
      {props.optionNamesById[key]}
    </button>
  ));

  return <div className="c-tabs">{buttonElements}</div>;
}
