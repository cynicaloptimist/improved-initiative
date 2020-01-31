import React = require("react");
import { TagState } from "../../common/CombatantState";
import { CommandContext } from "./CommandContext";

export function Tags(props: { tags: TagState[]; combatantId: string }) {
  const commandContext = React.useContext(CommandContext);
  return (
    <span className="combatant__tags">
      {props.tags.map((tag, i) => {
        return (
          <span key={i} className="tag">
            <span className="tag__text">
              {commandContext.EnrichText(tag.Text)}
            </span>
            <span
              className="fa-clickable fa-times"
              onClick={event => {
                commandContext.RemoveTagFromCombatant(props.combatantId, tag);
                event.stopPropagation();
              }}
            ></span>
          </span>
        );
      })}
    </span>
  );
}
