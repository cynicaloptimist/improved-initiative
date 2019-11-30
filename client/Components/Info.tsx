import Tippy from "@tippy.js/react";
import * as React from "react";

export function Info(props: { content: string }) {
  return (
    <Tippy content={props.content}>
      <i className="c-info fas fa-info-circle" />
    </Tippy>
  );
}
