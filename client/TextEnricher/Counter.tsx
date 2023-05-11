import * as _ from "lodash";

import * as React from "react";


export function BeanCounter(props: {
  current: number;
  maximum: number;
  onChange: (newValue: number) => void;
}): JSX.Element {
  return (
    <span className="bean-counter">
      <i className="fa-clickable fa-ban" onClick={_ => props.onChange(0)} />
      {_.range(1, props.maximum + 1).map(index => {
        return (
          <i
            key={index}
            className={
              props.current >= index
                ? "fa-clickable fa-circle"
                : "far-clickable fa-circle"
            }
            onClick={_ => props.onChange(index)}
          />
        );
      })}
    </span>
  );
}

export function Counter(props: {
  current: number;
  maximum: number;
  onChange: (newValue: number) => void;
}): JSX.Element {
  return (
    <input
      className="counter"
      type="number"
      min={0}
      max={props.maximum}
      defaultValue={props.current}
      onBlur={e => {
        const newValue = parseInt(e.target.value);
        if (isNaN(newValue) || newValue < 0 || newValue > props.maximum) {
          e.target.value = props.current.toString();
          return;
        } else {
          props.onChange(newValue);
        }
      }}
    />
  );
}
