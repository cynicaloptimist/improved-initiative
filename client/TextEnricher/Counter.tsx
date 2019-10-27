import React = require("react");

export function Counter(props: {
  current: string;
  maximum: string;
  onChange: (newValue: string) => void;
}) {
  return (
    <input
      className="counter"
      type="number"
      min="0"
      max={props.maximum}
      defaultValue={props.current}
      onBlur={e => props.onChange(e.target.value)}
    />
  );
}
