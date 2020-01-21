import React = require("react");
import { TagState } from "../../common/CombatantState";

export function Tags(props: {
  tags: TagState[];
  removeTag: (tagState: TagState) => void;
}) {
  return (
    <span className="combatant__tags">
      {props.tags.map(tag => {
        return (
          <span className="tag">
            <span className="tag__text">{tag.Text}</span>
            <span
              className="fa-clickable fa-times"
              onClick={() => props.removeTag(tag)}
              data-bind="click: $parent.RemoveTag, clickBubble:false"
            ></span>
          </span>
        );
      })}
    </span>
  );
}
