import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { EncounterReducer } from "./EncounterReducer";

describe("EncounterReducer", () => {
  it("Should add combatant from StatBlock", () => {
    const initialState = EncounterState.Default<CombatantState>();
    const statBlock = StatBlock.Default();
    statBlock.Name = "Goblin";
    const updatedEncounter = EncounterReducer(initialState, {
      type: "AddCombatantFromStatBlock",
      payload: { statBlock, combatantId: "goblinId" }
    });

    const insertedCombatant = updatedEncounter.Combatants[0];

    expect(insertedCombatant.StatBlock.Name).toEqual("Goblin");
    expect(insertedCombatant.Id).toEqual("goblinId");
  });
});
