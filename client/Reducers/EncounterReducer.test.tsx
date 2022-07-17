import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { cloneDeep, remove } from "lodash";
import { StatBlock } from "../../common/StatBlock";
import { Action } from "./EncounterActions";

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

function EncounterReducer(
  state: EncounterState<CombatantState>,
  action: Action
) {
  const newState = cloneDeep(state);
  if (action.type === "AddCombatantFromState") {
    newState.Combatants.push(action.payload.combatantState);
  }
  if (action.type === "AddCombatantFromStatBlock") {
    const combatant = InitializeCombatantFromStatBlock(
      action.payload.statBlock,
      action.payload.combatantId,
      action.payload.rolledHP
    );
    newState.Combatants.push(combatant);
  }
  if (action.type === "RemoveCombatant") {
    newState.Combatants = remove(
      newState.Combatants,
      c => c.Id === action.payload.combatantId
    );
  }

  return newState;
}

function InitializeCombatantFromStatBlock(
  statBlock: StatBlock,
  combatantId: string,
  rolledHP?: number
): CombatantState {
  return {
    StatBlock: statBlock,
    Id: combatantId,
    Alias: "",
    CurrentHP: rolledHP ?? statBlock.HP.Value,
    TemporaryHP: 0,
    Initiative: 0,
    IndexLabel: 0, //todo
    Hidden: false,
    RevealedAC: false,
    Tags: [],
    InterfaceVersion: process.env.VERSION || "unknown"
  };
}
