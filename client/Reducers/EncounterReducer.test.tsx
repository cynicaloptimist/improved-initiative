import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { cloneDeep, remove } from "lodash";
import { StatBlock } from "../../common/StatBlock";

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

type Action =
  | AddCombatantFromState
  | AddCombatantFromStatBlock
  | RemoveCombatant
  | StartEncounter
  | EndEncounter;

type AddCombatantFromState = {
  type: "AddCombatantFromState";
  payload: {
    combatantState: CombatantState;
  };
};
type AddCombatantFromStatBlock = {
  type: "AddCombatantFromStatBlock";
  payload: {
    combatantId: string;
    statBlock: StatBlock;
  };
};
type RemoveCombatant = {
  type: "RemoveCombatant";
  payload: {
    combatantId: string;
  };
};
type StartEncounter = {
  type: "StartEncounter";
};
type EndEncounter = {
  type: "EndEncounter";
};

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
      action.payload.combatantId
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
  combatantId: string
): CombatantState {
  return {
    StatBlock: statBlock,
    Id: combatantId,
    Alias: "",
    CurrentHP: statBlock.HP.Value, //todo: roll for max
    TemporaryHP: 0,
    Initiative: 0,
    IndexLabel: 0, //todo
    Hidden: false,
    RevealedAC: false,
    Tags: [],
    InterfaceVersion: process.env.VERSION || "unknown"
  };
}
