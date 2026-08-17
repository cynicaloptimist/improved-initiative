import Tippy from "@tippyjs/react";
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

/** Renders a library-row action using the existing icon and tooltip styles. */
export function ListingButton(props: Props) {
  const text = props.text || "";

  const cssClasses = [`c-listing-button`, `c-listing-${props.buttonClass}`];
  if (props.faClass) {
    cssClasses.push("fas", `fa-${props.faClass}`);
  }

  const button = (
    <span
      className={cssClasses.join(" ")}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {text} {props.children}
    </span>
  );

  return props.title ? <Tippy content={props.title}>{button}</Tippy> : button;
}
