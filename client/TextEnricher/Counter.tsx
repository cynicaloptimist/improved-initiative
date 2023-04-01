import _ = require("lodash");
import React = require("react");

export function CounterOrBracketedText(
  text: string,
  key: string,
  updateText?: (newText: string) => void
): JSX.Element {
  const matches = text.match(/\d+/g);
  if (updateText === undefined || !matches || matches.length < 2) {
    return <>[{text}]</>;
  }

  const current = parseInt(matches[0]);
  const maximum = parseInt(matches[1]);

  if (maximum < 1) {
    return <p key={key}>[{text}]</p>;
  }

  const counterProps = {
    key,
    current,
    maximum,
    onChange: (newValue: number) => {
      /*const location = TODO;
      const newText =
        text.substring(0, location) +
        newValue.toString() +
        text.substring(location + matches[0].length);
      updateText(newText); */
    }
  };

  if (maximum <= 9) {
    return <BeanCounter {...counterProps} />;
  }

  return <Counter {...counterProps} />;
}

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
