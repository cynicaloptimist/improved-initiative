import Tippy from "@tippy.js/react";
import React = require("react");

export function InitiativeListHeader(props: { encounterActive: boolean }) {
  const encounterStateIcon = props.encounterActive ? "fa-play" : "fa-pause";
  const encounterStateTip = props.encounterActive
    ? "Encounter Active"
    : "Encounter Inactive";

  return (
    <li className="combatant--header">
      <span className="combatant__leftsection">
        <span className="combatant__initiative">
          <Tippy content={encounterStateTip} boundary="window">
            <span className={"fas " + encounterStateIcon}></span>
          </Tippy>
        </span>
        <span className="combatant__name">Name</span>
        <span className="combatant__hp">
          <span className="fas fa-heart"></span>
        </span>
        <span className="combatant__ac">
          <span className="fas fa-shield-alt"></span>
        </span>
      </span>
      <span className="combatant__rightsection"></span>
    </li>
  );
}
