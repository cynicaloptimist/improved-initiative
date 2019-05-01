import { buildEncounter } from "../test/buildEncounter";

import { StatBlock } from "../../common/StatBlock";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { Encounter } from "./Encounter";

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
    expect(encounter.State()).toBe("inactive");
  });

  test("NextTurn changes the active combatant and will return to the top of the initiative order", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    combatant1.Initiative(10);
    combatant2.Initiative(5);
    encounter.StartEncounter();

    const promptReroll = jest.fn();
    expect(encounter.ActiveCombatant()).toBe(encounter.Combatants()[0]);
    encounter.NextTurn(promptReroll);
    expect(encounter.ActiveCombatant()).toBe(encounter.Combatants()[1]);
    encounter.NextTurn(promptReroll);
    expect(encounter.ActiveCombatant()).toBe(encounter.Combatants()[0]);
    expect(promptReroll).not.toBeCalled();
  });

  describe("Initiative Ordering", () => {
    test("By roll", () => {
      const slow = encounter.AddCombatantFromStatBlock(StatBlock.Default());
      const fast = encounter.AddCombatantFromStatBlock(StatBlock.Default());
      expect(encounter.Combatants()).toEqual([slow, fast]);

      fast.Initiative(20);
      slow.Initiative(1);
      encounter.StartEncounter();
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
      encounter.StartEncounter();
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
      encounter.StartEncounter();

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
      encounter.StartEncounter();
      expect(encounter.Combatants()).toEqual([playerCharacter, creature]);
    });
  });

  test("ActiveCombatantOnTop shows player view combatants in shifted order", () => {
    const settings = CurrentSettings();
    settings.PlayerView.ActiveCombatantOnTop = true;

    for (let i = 0; i < 5; i++) {
      let thisCombatant = encounter.AddCombatantFromStatBlock(
        StatBlock.Default()
      );
      thisCombatant.Initiative(i);
    }

    encounter.StartEncounter();
    expect(encounter.GetPlayerView().Combatants[0].Id).toBe(
      encounter.ActiveCombatant().Id
    );

    for (let i = 0; i < 5; i++) {
      encounter.NextTurn(jest.fn());
      expect(encounter.GetPlayerView().Combatants[0].Id).toBe(
        encounter.ActiveCombatant().Id
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
    encounter.StartEncounter();
    jest.advanceTimersByTime(10000); // 10 seconds
    encounter.EndEncounter();
    expect(encounter.TurnTimer.Readout()).toBe("0:00");
  });
});
