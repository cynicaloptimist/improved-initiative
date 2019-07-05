import * as React from "react";
import { ToggleFullscreen } from "../../Commands/ToggleFullscreen";

export const PlayerViewCombatantHeader = (props: {
  portraitColumnVisible: boolean;
  acColumnVisible: boolean;
}) => (
  <div className="combatant--header">
    <div className="combatant__initiative">
      <span className="fas fa-forward" />
    </div>
    {props.portraitColumnVisible && <div className="combatant__portrait" />}
    <div className="combatant__name">Combatant</div>
    <div className="combatant__hp">
      <span className="fas fa-heart" />
    </div>
    {props.acColumnVisible && (
      <div className="combatant__ac">
        <span className="fas fa-shield-alt" />
      </div>
    )}
    <div className="combatant__tags">
      <span className="fas fa-tag" />
      <span
        className="fas fa-expand fa-clickable"
        title="Toggle Full Screen"
        onClick={ToggleFullscreen}
      />
    </div>
  </div>
);
