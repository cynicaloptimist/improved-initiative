import Tippy from "@tippy.js/react";
import * as React from "react";

export function Info(props: { children: React.ReactChild }) {
  return (
    <Tippy content={props.children}>
      <i className="c-info fas fa-info-circle" />
    </Tippy>
  );
}
