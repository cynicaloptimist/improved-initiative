import * as React from "react";

export const PlayerViewCombatantHeader = (props: { showPortrait: boolean }) => (
  <div className="combatant--header">
    <div className="combatant__initiative">
      <span className="fas fa-forward" />
    </div>
    {props.showPortrait && <div className="combatant__portrait" />}
    <div className="combatant__name">Combatant</div>
    <div className="combatant__hp">
      <span className="fas fa-heart" />
    </div>
    <div className="combatant__tags">
      <span className="fas fa-tag" />
    </div>
  </div>
);
