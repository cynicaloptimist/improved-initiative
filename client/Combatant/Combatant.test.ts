import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";

describe("Combatant", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });

  test("Should have its Max HP set from the statblock", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" }
    });

    expect(combatant.MaxHP()).toBe(10);
  });

  test("Should update its Max HP when its statblock is updated", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Player: "player"
    });

    combatant.StatBlock({
      ...StatBlock.Default(),
      HP: { Value: 15, Notes: "" }
    });
    expect(combatant.MaxHP()).toBe(15);
  });

  test("Should notify the encounter when its statblock is updated", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Player: "player"
    });
    const combatantsSpy = jest.fn();
    encounter.Combatants.subscribe(combatantsSpy);

    combatant.StatBlock({
      ...StatBlock.Default(),
      HP: { Value: 15, Notes: "" }
    });
    expect(combatantsSpy).toBeCalled();
  });

  test("Should properly populate beancounters for monsters", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Traits: [
        {
          Name: "Spellcasting",
          Content:
            "• 1st level (4 slots): spell1, spell2\n• 2nd level (3 slots): spell3, spell4"
        },
        {
          Name: "Innate Spellcasting",
          Content: "3/day each: spell1, spell2\n1/day each: spell4, spell5"
        }
      ],
      Actions: [
        {
          Name: "Thrice Daily Action (3/Day)",
          Content: ""
        },
        {
          Name: "Recharge Action (Recharge 5-6)",
          Content: ""
        }
      ],
      LegendaryActions: [
        {
          Name: "",
          Content: ""
        }
      ],
      Player: ""
    });

    const combatant2 = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      Traits: [
        {
          Name: "Spellcasting",
          Content:
            "• 1st level (4 slots): spell1, spell2\n• 2nd level (3 slots): spell3, spell4"
        }
      ],
      Player: "player"
    });

    expect(combatant1.CurrentNotes()).toBe(
      "Spellcasting Slots\n\n1st Level [4/4]\n\n2nd Level [3/3]\n\n" +
        "Innate Spellcasting Slots\n\n[3/3]\n\n[1/1]\n\n" +
        "Legendary Actions [3/3]\n\n" +
        "Thrice Daily Action [3/3]\n\n" +
        "Recharge Action [1/1]"
    );
    expect(combatant2.CurrentNotes()).toBe("");
  });
});
