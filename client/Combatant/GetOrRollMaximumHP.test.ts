import { StatBlock } from "../../common/StatBlock";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { GetOrRollMaximumHP, VariantMaximumHP } from "./GetOrRollMaximumHP";

describe("GetOrRollMaximumHP", () => {
  let statBlock: StatBlock;

  beforeEach(() => {
    InitializeSettings();
    statBlock = StatBlock.Default();
    statBlock.HP = {
      Value: 12, // Lower than the minimum to test rolling dice vs. using value
      Notes: "8d10 + 16" // Average: 40 | Minimum: 24 | Maximum: 96
    };
  });

  test("Should use stat block's HP value by default", () => {
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.DEFAULT);
    expect(hp).toEqual(12);
  });

  test("Should roll stat block's HP if setting is enabled", () => {
    const settings = CurrentSettings();
    settings.Rules.RollMonsterHp = true;
    CurrentSettings(settings);

    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.DEFAULT);
    expect(hp).toBeGreaterThanOrEqual(24);
    expect(hp).toBeLessThanOrEqual(96);
  });

  test("Should return 1 HP for VariantMaximumHP.MINION", () => {
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.MINION);
    expect(hp).toEqual(1);
  });

  test("Should return max rolled HP for VariantMaximumHP.BOSS", () => {
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.BOSS);
    expect(hp).toEqual(96);
  });
});
