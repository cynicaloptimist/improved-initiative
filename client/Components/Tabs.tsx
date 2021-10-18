import * as React from "react";

export function Tabs<TKey extends string>(props: {
  optionNamesById: Record<TKey, string>;
  selected?: TKey;
  onChoose: (option: TKey) => void;
}) {
  const buttonElements = Object.keys(props.optionNamesById).map(
    (key: TKey, i) => (
      <button
        type="button"
        key={key}
        className={props.selected == key ? "c-tab s-selected" : "c-tab"}
        onClick={() => props.onChoose(key)}
      >
        {props.optionNamesById[key]}
      </button>
    )
  );

  return <div className="c-tabs">{buttonElements}</div>;
}
