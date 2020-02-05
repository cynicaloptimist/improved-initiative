import React = require("react");
import Tippy from "@tippy.js/react";
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
            {tag.DurationCombatantId.length > 0 && (
              <Tippy
                content={`Remaining rounds: ${tag.DurationRemaining}`}
                boundary="window"
              >
                <span className="tag__icon fas fa-hourglass">
                  {tag.DurationRemaining}
                </span>
              </Tippy>
            )}
            {tag.Hidden && (
              <Tippy content="Tag hidden from Player View" boundary="window">
                <span className="tag__icon fas fa-eye-slash" />
              </Tippy>
            )}

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
