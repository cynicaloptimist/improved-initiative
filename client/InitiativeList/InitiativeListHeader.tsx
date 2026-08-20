import * as React from "react";
import { SettingsContext } from "../Settings/SettingsContext";

export function InitiativeListHeader(props: {
  encounterActive: boolean;
  showManaColumn: boolean;
}) {
  const settings = React.useContext(SettingsContext);

  return (
    <thead className="combatant--header">
      <tr>
        <th className="combatant__left-gutter" />

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

        {props.showManaColumn && (
          <th className="combatant__mana">
            <span className="screen-reader-only">Mana</span>
            <span
              className="fas fa-hat-wizard"
              title="Mana"
              aria-hidden="true"
            ></span>
          </th>
        )}

        <th className="combatant__ac">
          <span className="screen-reader-only">Defense</span>
          <span
            className="fas fa-shield-alt"
            title="Defense"
            aria-hidden="true"
          ></span>
        </th>

        {settings.StatBlock.CustomFields.filter(f => f.showInEncounterView).map(
          (field, index) => (
            <th
              key={index}
              className="combatant__custom-field"
              style={{
                width: field.combatantRowWidth
                  ? field.combatantRowWidth + "px"
                  : "20px"
              }}
            >
              {field.combatantRowHeader || field.name}
            </th>
          )
        )}

        <th align="right">
          <span className="screen-reader-only">Tags and commands</span>
        </th>
      </tr>
    </thead>
  );
}
