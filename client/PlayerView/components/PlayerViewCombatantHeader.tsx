import * as React from "react";
import {
  ToggleFullscreen,
  FullscreenSupported
} from "../../Commands/ToggleFullscreen";

export const PlayerViewCombatantHeader = (props: {
  portraitColumnVisible: boolean;
  acColumnVisible: boolean;
}) => (
  <div className="combatant--header" data-ii-role="combatant-header">
    <div className="combatant__initiative" data-ii-field="initiative">
      <span className="fas fa-forward" />
    </div>
    {props.portraitColumnVisible && (
      <div className="combatant__portrait" data-ii-field="portrait" />
    )}
    <div className="combatant__name" data-ii-field="name">
      Combatant
    </div>
    <div className="combatant__hp" data-ii-field="hit-points">
      <span className="fas fa-heart" />
    </div>
    {props.acColumnVisible && (
      <div className="combatant__ac" data-ii-field="armor-class">
        <span className="fas fa-shield-alt" />
      </div>
    )}
    <div className="combatant__tags" data-ii-field="tags">
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
