import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { CombatantState } from "../../common/CombatantState";
import { EncounterState } from "../../common/EncounterState";
import { InitiativeList } from "./InitiativeList";

Enzyme.configure({ adapter: new Adapter() });

describe("InitiativeList", () => {
  it("Shows a pause icon when encounter is inactive", () => {
    const encounterState = EncounterState.Default<CombatantState>();
    const initiativeList = Enzyme.mount(
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={[]}
        combatantCountsByName={{}}
      />
    );
    expect(initiativeList.find(".fa-pause").length).toEqual(1);
  });

  it("Shows a play icon when encounter is active", () => {
    const encounterState = EncounterState.Default<CombatantState>();
    encounterState.ActiveCombatantId = "someId";
    const initiativeList = Enzyme.mount(
      <InitiativeList
        encounterState={encounterState}
        selectedCombatantIds={[]}
        combatantCountsByName={{}}
      />
    );
    expect(initiativeList.find(".fa-play").length).toEqual(1);
  });
});
