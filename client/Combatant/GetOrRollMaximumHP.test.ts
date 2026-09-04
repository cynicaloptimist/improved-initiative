import { StatBlock } from "../../common/StatBlock";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { GetOrRollMaximumHP, VariantMaximumHP } from "./GetOrRollMaximumHP";

describe("GetOrRollMaximumHP", () => {
  let statBlock: StatBlock;

  beforeEach(() => {
    InitializeTestSettings();
    statBlock = StatBlock.Default();
    statBlock.HP = {
      Value: 12, // Lower than the minimum to test rolling dice vs. using value
      Notes: "8d10 + 16" // Average: 40 | Minimum: 24 | Maximum: 96
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Should use stat block's HP value by default", () => {
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.DEFAULT);
    expect(hp).toEqual(12);
  });

  test("Should roll stat block's HP if setting is enabled", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    InitializeTestSettings({
      Rules: {
        RollMonsterHp: true
      }
    });

    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.DEFAULT);
    expect(hp).toEqual(24);
  });

  test("Should return 1 HP for VariantMaximumHP.MINION", () => {
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.MINION);
    expect(hp).toEqual(1);
  });

  test("Should return maximum boss HP even when rolls produce minimum values", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const hp = GetOrRollMaximumHP(statBlock, VariantMaximumHP.BOSS);
    expect(hp).toEqual(96);
  });

  test.each([
    VariantMaximumHP.DEFAULT,
    VariantMaximumHP.MINION,
    VariantMaximumHP.BOSS
  ])(
    "preserves player HP for variant %s even with HP rolling enabled",
    variant => {
      InitializeTestSettings({ Rules: { RollMonsterHp: true } });
      statBlock.Player = "player";

      expect(GetOrRollMaximumHP(statBlock, variant)).toBe(12);
    }
  );

  test.each(["1d6 - 1", "1d6 - 2"])(
    "returns 1 HP when %s rolls zero or less",
    expression => {
      InitializeTestSettings({ Rules: { RollMonsterHp: true } });
      jest.spyOn(Math, "random").mockReturnValue(0);
      statBlock.HP.Notes = expression;

      expect(GetOrRollMaximumHP(statBlock, VariantMaximumHP.DEFAULT)).toBe(1);
    }
  );

  test.each([VariantMaximumHP.DEFAULT, VariantMaximumHP.BOSS])(
    "falls back to listed HP for invalid notation with variant %s",
    variant => {
      InitializeTestSettings({ Rules: { RollMonsterHp: true } });
      jest.spyOn(console, "error").mockImplementation(() => {});
      statBlock.HP.Notes = "not dice";

      expect(GetOrRollMaximumHP(statBlock, variant)).toBe(12);
    }
  );
});
