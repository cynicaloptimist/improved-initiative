import Tippy, { TippyProps } from "@tippy.js/react";
import * as React from "react";

export function Info(props: {
  children: React.ReactChild;
  tippyProps?: Omit<TippyProps, "content" | "children">;
}) {
  return (
    <Tippy content={props.children} {...props.tippyProps}>
      <i className="c-info fas fa-info-circle" />
    </Tippy>
  );
}
