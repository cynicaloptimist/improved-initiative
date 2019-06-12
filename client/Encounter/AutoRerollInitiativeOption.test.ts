import { AutoRerollInitiativeOption } from "../../common/Settings";
import { StatBlock } from "../../common/StatBlock";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "../test/buildEncounter";

describe("AutoRerollInitiativeOption", () => {
  beforeEach(() => {
    InitializeSettings();
  });

  const runEncounter = promptReroll => {
    const encounter = buildEncounter();
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    combatant1.Initiative(10);
    combatant2.Initiative(5);
    encounter.EncounterFlow.StartEncounter();
    encounter.EncounterFlow.NextTurn(promptReroll);
    encounter.EncounterFlow.NextTurn(promptReroll);
    return encounter;
  };

  test("Default", () => {
    const promptReroll = jest.fn();
    runEncounter(promptReroll);
    expect(promptReroll).not.toBeCalled();
  });

  test("Prompt", () => {
    const settings = CurrentSettings();
    settings.Rules.AutoRerollInitiative = AutoRerollInitiativeOption.Prompt;
    CurrentSettings(settings);
    const promptReroll = jest.fn();
    runEncounter(promptReroll);
    expect(promptReroll).toBeCalled();
  });

  test("Automatic", () => {
    const settings = CurrentSettings();
    settings.Rules.AutoRerollInitiative = AutoRerollInitiativeOption.Automatic;
    CurrentSettings(settings);
    const promptReroll = jest.fn();
    Math.random = () => 1;
    const encounter = runEncounter(promptReroll);
    expect(encounter.Combatants()[0].Initiative()).toEqual(20);
    expect(encounter.Combatants()[1].Initiative()).toEqual(20);
  });
});
