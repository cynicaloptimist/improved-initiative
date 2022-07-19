import { EncounterState } from "../../common/EncounterState";
import { CombatantState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";
import { EncounterReducer } from "./EncounterReducer";
import { InitializeCombatantFromStatBlock } from "./InitializeCombatantFromStatBlock";

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

  it("Should sort combatants by initiative when starting the encounter", () => {
    const statBlock = StatBlock.Default();
    statBlock.Name = "Goblin";
    const initialState = EncounterState.Default<CombatantState>();
    initialState.Combatants = [
      InitializeCombatantFromStatBlock(statBlock, "fast"),
      InitializeCombatantFromStatBlock(statBlock, "medium"),
      InitializeCombatantFromStatBlock(statBlock, "slow")
    ];

    const updatedEncounter = EncounterReducer(initialState, {
      type: "StartEncounter",
      payload: {
        initiativesByCombatantId: {
          medium: 5,
          fast: 10,
          slow: 1
        }
      }
    });

    expect(updatedEncounter.Combatants.map(c => c.Id)).toEqual([
      "fast",
      "medium",
      "slow"
    ]);

    expect(updatedEncounter.ActiveCombatantId).toEqual("fast");
  });

  it("Should advance through the turn order", () => {
    const activeEncounter = BuildActiveEncounter();
    const nextTurn = EncounterReducer(activeEncounter, { type: "NextTurn" });
    expect(nextTurn.ActiveCombatantId).toEqual("second");
  });

  it("Should wrap around the initiative order for next turn", () => {
    const activeEncounter = BuildActiveEncounter();
    activeEncounter.ActiveCombatantId = "third";
    const nextTurn = EncounterReducer(activeEncounter, { type: "NextTurn" });
    expect(nextTurn.ActiveCombatantId).toEqual("first");
  });

  it("Should wrap around the initiative order for previous turn", () => {
    const activeEncounter = BuildActiveEncounter();
    const nextTurn = EncounterReducer(activeEncounter, {
      type: "PreviousTurn"
    });
    expect(nextTurn.ActiveCombatantId).toEqual("third");
  });
});

function BuildActiveEncounter() {
  const goblin = StatBlock.Default();
  goblin.Name = "Goblin";
  const initialState = EncounterState.Default<CombatantState>();
  initialState.Combatants = [
    InitializeCombatantFromStatBlock(goblin, "first"),
    InitializeCombatantFromStatBlock(goblin, "second"),
    InitializeCombatantFromStatBlock(goblin, "third")
  ];

  const activeEncounter = EncounterReducer(initialState, {
    type: "StartEncounter",
    payload: {
      initiativesByCombatantId: {
        first: 10,
        second: 9,
        third: 8
      }
    }
  });

  return activeEncounter;
}
