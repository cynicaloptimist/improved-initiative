import _ = require("lodash");
import React = require("react");

export function CounterOrBracketedText(
  text: string,
  updateText?: (newText: string) => void
) {
  return (props: { children: React.ReactChildren }) => {
    const element = props.children[0];
    if (!element) {
      return <>[]</>;
    }
    const innerText: string = element.props.value || "";
    const matches = innerText.match(/\d+/g);
    if (updateText === undefined || !matches || matches.length < 2) {
      return <>[{innerText}]</>;
    }

    const current = parseInt(matches[0]);
    const maximum = parseInt(matches[1]);

    const counterProps = {
      current,
      maximum,
      onChange: newValue => {
        const location = element.props.sourcePosition.start.offset;
        const newText =
          text.substr(0, location) +
          newValue +
          text.substr(location + matches[0].length);
        updateText(newText);
      }
    };

    if (maximum <= 9) {
      return <BeanCounter {...counterProps} />;
    }

    return <Counter {...counterProps} />;
  };
}

export function BeanCounter(props: {
  current: number;
  maximum: number;
  onChange: (newValue: string) => void;
}) {
  return (
    <span className="bean-counter">
      <i className="fa-clickable fa-ban" onClick={_ => props.onChange("0")} />
      {_.range(1, props.maximum + 1).map(index => {
        return (
          <i
            className={
              props.current >= index
                ? "fa-clickable fa-circle"
                : "far-clickable fa-circle"
            }
            onClick={_ => props.onChange(index.toString())}
          />
        );
      })}
    </span>
  );
}

export function Counter(props: {
  current: number;
  maximum: number;
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
