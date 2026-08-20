import * as React from "react";
import {
  ToggleFullscreen,
  FullscreenSupported
} from "../../Commands/ToggleFullscreen";

export const PlayerViewCombatantHeader = (props: {
  portraitColumnVisible: boolean;
  acColumnVisible: boolean;
  manaColumnVisible: boolean;
}) => (
  <div className="combatant--header">
    {props.portraitColumnVisible && <div className="combatant__portrait" />}
    <div className="combatant__name">Combatant</div>
    <div className="combatant__hp">
      <span className="fas fa-heart" />
    </div>
    {props.manaColumnVisible && (
      <div className="combatant__mana">
        <span className="fas fa-hat-wizard" />
      </div>
    )}
    {props.acColumnVisible && (
      <div className="combatant__ac">
        <span className="fas fa-shield-alt" />
      </div>
    )}
    <div className="combatant__tags">
      <span className="fas fa-tag" />
      {FullscreenSupported() && (
        <span
          className="fas fa-expand fa-clickable"
          title="Toggle Full Screen"
          onClick={ToggleFullscreen}
        />
      )}
    </div>
  </div>
);
