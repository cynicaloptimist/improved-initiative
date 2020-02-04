import Tippy from "@tippy.js/react";
import React = require("react");

export function InitiativeListHeader(props: { encounterActive: boolean }) {
  const encounterStateIcon = props.encounterActive ? "fa-play" : "fa-pause";
  const encounterStateTip = props.encounterActive
    ? "Encounter Active"
    : "Encounter Inactive";

  return (
    <thead className="combatant--header">
      <tr>
        <th className="combatant__initiative">
          <span className="screen-reader-only">Initiative Score</span>
          <div aria-hidden="true">
            <Tippy content={encounterStateTip} boundary="window">
              <span className={"fas " + encounterStateIcon}></span>
            </Tippy>
          </div>
        </th>
        <th className="combatant__image" aria-hidden="true"></th>
        <th className="combatant__name" align="left">
          Name
        </th>
        <th className="combatant__hp">
          <span className="screen-reader-only">Health</span>
          <span
            className="fas fa-heart"
            title="Health"
            aria-hidden="true"
          ></span>
        </th>
        <th className="combatant__ac">
          <span className="screen-reader-only">Armour Class</span>
          <span
            className="fas fa-shield-alt"
            title="Armour Class"
            aria-hidden="true"
          ></span>
        </th>
        <th align="right">Tags</th>
        <th className="combatant__commands">Commands</th>
      </tr>
    </thead>
  );
}
