import * as React from "react";
import Tippy from "@tippyjs/react";

export function SpentReactionIndicator(): JSX.Element {
  return (
    <Tippy content="Reaction Spent">
      <span className="fa-stack reaction-tracker">
        <i className="fas fa-reply fa-stack-2x reaction-tracker__shadow"></i>
        <i className="fas fa-slash fa-stack-2x"></i>
      </span>
    </Tippy>
  );
}
