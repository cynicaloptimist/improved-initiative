import { render } from "@testing-library/react";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { InitiativeList } from "./InitiativeList";

describe("InitiativeList", () => {
  it("Shows a pause icon when encounter is inactive", () => {
    const encounterState = EncounterState.Default<CombatantState>();
    const initiativeList = render(
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={[]}
        combatantCountsByName={{}}
      />
    );
    expect(
      initiativeList.getByTestId("encounter-state-icon").classList
    ).toContain("fa-pause");
  });

  it("Shows a play icon when encounter is active", () => {
    const encounterState = EncounterState.Default<CombatantState>();
    encounterState.ActiveCombatantId = "someId";
    const initiativeList = render(
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={[]}
        combatantCountsByName={{}}
      />
    );
    expect(
      initiativeList.getByTestId("encounter-state-icon").classList
    ).toContain("fa-play");
  });
});
