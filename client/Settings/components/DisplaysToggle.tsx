import * as React from "react";
import { ToggleButton } from "./Toggle";
import { Info } from "../../Components/Info";
import { env } from "../../Environment";

export function DisplaysToggle(props: {
  children: React.ReactNode;
  fieldName: string;
  requireEpicTierForPlayerViewToggle?: boolean;
}) {
  const fieldEncounterViewId = `toggle_TrackerView.${props.fieldName}`;
  const fieldPlayerViewId = `toggle_PlayerView.${props.fieldName}`;

  const showEpicTierNotice =
    props.requireEpicTierForPlayerViewToggle && !env.HasEpicInitiative;

  const epicTierNotice = showEpicTierNotice && (
    <Info>This feature is available for Epic Tier subscribers.</Info>
  );

  return (
    <div className="c-display-toggles">
      <div className="c-display-toggles__label">{props.children}</div>
      <div className="c-display-toggles__toggle">
        <ToggleButton
          fieldName={"TrackerView." + props.fieldName}
          id={fieldEncounterViewId}
        />
      </div>
      <div className="c-display-toggles__toggle">
        {epicTierNotice || (
          <ToggleButton
            fieldName={"PlayerView." + props.fieldName}
            id={fieldPlayerViewId}
          />
        )}
      </div>
    </div>
  );
}

export function DisplaysToggleHeader() {
  return (
    <div className="c-display-toggles">
      <div className="c-display-toggles__headertext">
        <h3>Display</h3>
      </div>
      <div className="c-display-toggles--header__label">Encounter View</div>
      <div className="c-display-toggles--header__label">Player View</div>
    </div>
  );
}
