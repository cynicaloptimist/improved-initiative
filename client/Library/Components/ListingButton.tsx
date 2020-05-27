import * as React from "react";

interface Props {
  text?: string;
  buttonClass: string;
  faClass?: string;
  onClick: React.MouseEventHandler<HTMLSpanElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLSpanElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLSpanElement>;
  title?: string;
  children?: React.ReactNode;
}

export function ListingButton(props: Props) {
  const text = props.text || "";

  const cssClasses = [`c-listing-button`, `c-listing-${props.buttonClass}`];
  if (props.faClass) {
    cssClasses.push("fas", `fa-${props.faClass}`);
  }

  return (
    <span
      className={cssClasses.join(" ")}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      title={props.title}
    >
      {text} {props.children}
    </span>
  );
}
