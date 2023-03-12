import { StatBlock } from "../../common/StatBlock";
import { InitializeSettings } from "../Settings/Settings";
import { CombatantsReducer } from "./CombatantsReducer";
import { InitializeCombatantFromStatBlock } from "./InitializeCombatantFromStatBlock";

describe("CombatantsReducer", () => {
  it("Should handle SetStatBlock", () => {
    const statBlock = StatBlock.Default();
    statBlock.Name = "Original";
    const combatant = InitializeCombatantFromStatBlock(statBlock, "testId");
    const newStatBlock = StatBlock.Default();
    newStatBlock.Name = "Updated";

    const updatedCombatants = CombatantsReducer([combatant], {
      type: "SetStatBlock",
      combatantId: "testId",
      newStatBlock: newStatBlock
    });

    expect(updatedCombatants[0].StatBlock).toEqual(newStatBlock);
  });

  it("Should handle ApplyDamage", () => {
    InitializeSettings();
    const statBlock = StatBlock.Default();
    statBlock.HP.Value = 10;
    const combatant = InitializeCombatantFromStatBlock(statBlock, "testId");

    const updatedCombatants = CombatantsReducer([combatant], {
      type: "ApplyDamage",
      combatantId: "testId",
      damageAmount: 5
    });

    expect(updatedCombatants[0].CurrentHP).toEqual(5);
  });
});
