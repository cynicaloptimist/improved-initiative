import * as React from "react";

export function Tabs<TKey extends string>(props: {
  optionNamesById: Record<TKey, string>;
  selected?: TKey | string;
  onChoose: (option: TKey) => void;
}) {
  const buttonElements = Object.keys(props.optionNamesById).map(
    (key: TKey, i) => {
      const isSelected =
        props.selected == props.optionNamesById[key] || props.selected == key;
      return (
        <button
          type="button"
          key={key}
          className={isSelected ? "c-tab s-selected" : "c-tab"}
          onClick={() => props.onChoose(key)}
        >
          {props.optionNamesById[key]}
        </button>
      );
    }
  );

  return <div className="c-tabs">{buttonElements}</div>;
}
