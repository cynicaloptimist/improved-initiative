import * as React from "react";

export function PaneHeader(props: {
  title: string;
  fontAwesomeIcon: string;
  buttons: React.ReactChild;
}) {
  return (
    <div className="libraries__header">
      <h2>
        <i className={`fas fa-${props.fontAwesomeIcon}`} /> {props.title}
      </h2>
      <div>{props.buttons}</div>
    </div>
  );
}
