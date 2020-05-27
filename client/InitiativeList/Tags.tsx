import React = require("react");
import Tippy from "@tippyjs/react";
import { TagState } from "../../common/CombatantState";
import { CommandContext } from "./CommandContext";
import { TextEnricherContext } from "../TextEnricher/TextEnricher";

export function Tags(props: { tags: TagState[]; combatantId: string }) {
  return (
    <ul className="combatant__tags">
      {props.tags.map((tag, i) => (
        <Tag
          combatantId={props.combatantId}
          tag={tag}
          key={props.combatantId + "_tag_" + i}
        />
      ))}
    </ul>
  );
}

function Tag(props: { combatantId: string; tag: TagState }) {
  const commandContext = React.useContext(CommandContext);
  const TextEnricher = React.useContext(TextEnricherContext);

  const removeTag = React.useCallback(
    event => {
      commandContext.RemoveTagFromCombatant(props.combatantId, props.tag);
      event.stopPropagation();
    },
    [commandContext, props.combatantId, props.tag]
  );

  return (
    <li className="tag">
      <span className="tag__text">
        {TextEnricher.EnrichText(props.tag.Text)}
      </span>
      {props.tag.DurationCombatantId.length > 0 && (
        <Tippy content={`Remaining rounds: ${props.tag.DurationRemaining}`}>
          <span className="tag__icon fas fa-hourglass">
            {props.tag.DurationRemaining}
          </span>
        </Tippy>
      )}
      {props.tag.Hidden && (
        <Tippy content="Tag hidden from Player View">
          <span className="tag__icon fas fa-eye-slash" />
        </Tippy>
      )}

      <button
        aria-label={`Remove ${props.tag.Text}`}
        className="tag__button fa-clickable fa-times"
        onClick={removeTag}
      ></button>
    </li>
  );
}
