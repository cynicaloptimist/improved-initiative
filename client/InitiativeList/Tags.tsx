import React = require("react");
import { TagState } from "../../common/CombatantState";

export function Tags(props: { tags: (string | TagState)[] }) {
  return <span className="combatant__tags">{props.tags.map(renderTag)}</span>;
}

function renderTag(tagState: string | TagState) {
  if (typeof tagState == "string") {
    return <span className="tag">{tagState}</span>;
  }

  return <span className="tag">{tagState.Text}</span>;
}
