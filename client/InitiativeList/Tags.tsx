import React = require("react");
import { TagState } from "../../common/CombatantState";

export function Tags(props: { tags: TagState[] }) {
  return <span className="combatant__tags">{props.tags.map(renderTag)}</span>;
}

function renderTag(tagState: TagState) {
  return <span className="tag">{tagState.Text}</span>;
}
