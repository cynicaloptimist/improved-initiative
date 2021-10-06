import { buildEncounter } from "../test/buildEncounter";

import { StatBlock } from "../../common/StatBlock";
import { Tag } from "../Combatant/Tag";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { GetTimerReadout } from "../Widgets/GetTimerReadout";
import { Encounter } from "./Encounter";

console.log(process.version);

describe("Encounter", () => {
  let encounter: Encounter;
  beforeEach(() => {
    InitializeSettings();
    encounter = buildEncounter();
  });

  test("A new Encounter has no combatants", () => {
    expect(encounter.Combatants().length).toBe(0);
  });

  test("Adding a statblock results in a combatant", () => {
    const statBlock = StatBlock.Default();
    encounter.AddCombatantFromStatBlock(statBlock);
    expect(encounter.Combatants().length).toBe(1);
    expect(encounter.Combatants()[0].StatBlock()).toEqual(statBlock);
  });

  test("Combat should not be active", () => {
    expect(encounter.EncounterFlow.State()).toBe("inactive");
  });

  test("NextTurn changes the active combatant and will return to the top of the initiative order", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    combatant1.Initiative(10);
    combatant2.Initiative(5);
    encounter.EncounterFlow.StartEncounter();

    const promptReroll = jest.fn();
    expect(encounter.EncounterFlow.ActiveCombatant()).toBe(
      encounter.Combatants()[0]
    );
    encounter.EncounterFlow.NextTurn(promptReroll);
    expect(encounter.EncounterFlow.ActiveCombatant()).toBe(
      encounter.Combatants()[1]
    );
    encounter.EncounterFlow.NextTurn(promptReroll);
    expect(encounter.EncounterFlow.ActiveCombatant()).toBe(
      encounter.Combatants()[0]
    );
    expect(promptReroll).not.toBeCalled();
  });

  test("Display post-combat stats produces reasonable results", () => {
    jest.useFakeTimers();

    for (let i = 0; i < 2; i++) {
      const thisCombatant = encounter.AddCombatantFromStatBlock(
        StatBlock.Default()
      );
      thisCombatant.Initiative(2 - i);
      thisCombatant.Alias(`Combatant ${i}`);
    }

    encounter.EncounterFlow.StartEncounter();

    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(60 * 1000);
      encounter.EncounterFlow.NextTurn(jest.fn());
    }

    expect(
      GetTimerReadout(encounter.EncounterFlow.CombatTimer.ElapsedSeconds())
    ).toBe("5:00");

    const combatant0Elapsed = encounter
        .Combatants()[0]
        .CombatTimer.ElapsedSeconds(),
      combatant0Rounds = encounter.Combatants()[0].CombatTimer.ElapsedRounds();

    expect(GetTimerReadout(combatant0Elapsed / combatant0Rounds)).toBe("1:00");

    const combatant1Elapsed = encounter
        .Combatants()[1]
        .CombatTimer.ElapsedSeconds(),
      combatant1Rounds = encounter.Combatants()[1].CombatTimer.ElapsedRounds();

    expect(GetTimerReadout(combatant1Elapsed / combatant1Rounds)).toBe("0:40");
  });

  test("Should properly populate beancounters for monsters", () => {
    const combatant = encounter.AddCombatantFromStatBlock({
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

    expect(combatant.CurrentNotes()).toBe(
      "Spellcasting Slots\n\n1st Level [4/4]\n\n2nd Level [3/3]\n\n" +
        "Innate Spellcasting Slots\n\n[3/3]\n\n[1/1]\n\n" +
        "Legendary Actions [3/3]\n\n" +
        "Thrice Daily Action [3/3]\n\n" +
        "Recharge Action [1/1]"
    );
  });

  describe("Initiative Ordering", () => {
    test("By roll", () => {
      const slow = encounter.AddCombatantFromStatBlock(StatBlock.Default());
      const fast = encounter.AddCombatantFromStatBlock(StatBlock.Default());
      expect(encounter.Combatants()).toEqual([slow, fast]);

      fast.Initiative(20);
      slow.Initiative(1);
      encounter.EncounterFlow.StartEncounter();
      expect(encounter.Combatants()).toEqual([fast, slow]);
    });

    test("By modifier", () => {
      const slow = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        InitiativeModifier: 0
      });
      const fast = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        InitiativeModifier: 2
      });
      encounter.EncounterFlow.StartEncounter();
      expect(encounter.Combatants()).toEqual([fast, slow]);
    });

    test("By group modifier", () => {
      const slow = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        InitiativeModifier: 0
      });
      const fast = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        InitiativeModifier: 2
      });
      const loner = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        InitiativeModifier: 1
      });
      slow.InitiativeGroup("group");
      fast.InitiativeGroup("group");
      encounter.EncounterFlow.StartEncounter();

      expect(encounter.Combatants()).toEqual([fast, slow, loner]);
    });

    test("Favor player characters", () => {
      const creature = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default()
      });
      const playerCharacter = encounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        Player: "player"
      });
      encounter.EncounterFlow.StartEncounter();
      expect(encounter.Combatants()).toEqual([playerCharacter, creature]);
    });
  });

  test("ActiveCombatantOnTop shows player view combatants in shifted order", () => {
    const settings = CurrentSettings();
    settings.PlayerView.ActiveCombatantOnTop = true;

    for (let i = 0; i < 5; i++) {
      const thisCombatant = encounter.AddCombatantFromStatBlock(
        StatBlock.Default()
      );
      thisCombatant.Initiative(i);
    }

    encounter.EncounterFlow.StartEncounter();
    expect(encounter.GetPlayerView().Combatants[0].Id).toBe(
      encounter.EncounterFlow.ActiveCombatant().Id
    );

    for (let i = 0; i < 5; i++) {
      encounter.EncounterFlow.NextTurn(jest.fn());
      expect(encounter.GetPlayerView().Combatants[0].Id).toBe(
        encounter.EncounterFlow.ActiveCombatant().Id
      );
    }
  });

  test("Encounter turn timer stops when encounter ends", () => {
    jest.useFakeTimers();
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10, Notes: "" },
      Player: "player"
    });
    encounter.EncounterFlow.StartEncounter();
    jest.advanceTimersByTime(10000); // 10 seconds
    encounter.EncounterFlow.EndEncounter();
    expect(encounter.EncounterFlow.TurnTimerReadout()).toBe("0:00");
  });
});

describe("Tags", () => {
  beforeEach(() => {
    InitializeSettings();
  });

  test("Should appear in Player View", () => {
    const encounter = buildEncounter();
    const combatant = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    combatant.Tags.push(new Tag("Some Tag", combatant, false));
    const playerView = encounter.GetPlayerView();
    const playerViewCombatant = playerView.Combatants[0];
    expect(playerViewCombatant.Tags).toEqual([
      {
        Text: "Some Tag",
        DurationRemaining: -1,
        DurationTiming: "StartOfTurn",
        DurationCombatantId: ""
      }
    ]);
  });

  test("Should not appear in Player View when hidden", () => {
    const encounter = buildEncounter();
    const combatant = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    combatant.Tags.push(new Tag("Some Tag", combatant, true));
    const playerView = encounter.GetPlayerView();
    const playerViewCombatant = playerView.Combatants[0];
    expect(playerViewCombatant.Tags).toEqual([]);
  });
});

describe("LoadEncounterState", () => {
  test("Should load combatants in order", () => {
    const baseEncounter = buildEncounter();

    for (const initiative of [10, 5, 15]) {
      const combatant = baseEncounter.AddCombatantFromStatBlock({
        ...StatBlock.Default(),
        Name: "Initiative " + initiative
      });
      combatant.Initiative(initiative);
    }

    baseEncounter.EncounterFlow.StartEncounter();

    expect(baseEncounter.Combatants().map(c => c.Initiative())).toEqual([
      15,
      10,
      5
    ]);
    expect(baseEncounter.EncounterFlow.State()).toEqual("active");

    const encounterState = baseEncounter.ObservableEncounterState();
    const encounter = buildEncounter();
    encounter.LoadEncounterState(encounterState, () => {}, null);

    expect(encounter.Combatants().map(c => c.Initiative())).toEqual([
      15,
      10,
      5
    ]);
    expect(encounter.EncounterFlow.State()).toEqual("active");
  });
});
