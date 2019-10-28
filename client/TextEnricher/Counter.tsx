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

    return <Counter {...counterProps} />;
  };
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
