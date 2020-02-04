import React = require("react");
import { TagState } from "../../common/CombatantState";
import { CommandContext } from "./CommandContext";

export function Tags(props: { tags: TagState[]; combatantId: string }) {
  const commandContext = React.useContext(CommandContext);
  return (
    <ul className="combatant__tags">
      {props.tags.map((tag, i) => {
        return (
          <li key={i} className="tag">
            <span className="tag__text">
              {commandContext.EnrichText(tag.Text)}
            </span>
            <button
              aria-label={`Remove ${tag.Text}`}
              className="tag__button fa-clickable fa-times"
              onClick={event => {
                commandContext.RemoveTagFromCombatant(props.combatantId, tag);
                event.stopPropagation();
              }}
            ></button>
          </li>
        );
      })}
    </ul>
  );
}
