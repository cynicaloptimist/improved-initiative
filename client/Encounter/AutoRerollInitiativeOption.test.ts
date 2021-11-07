import { AutoRerollInitiativeOption } from "../../common/Settings";
import { StatBlock } from "../../common/StatBlock";
import { InitializeTestSettings } from "../test/InitializeTestSettings";
import { buildEncounter } from "../test/buildEncounter";

describe("AutoRerollInitiativeOption", () => {
  beforeEach(() => {
    InitializeTestSettings();
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
    InitializeTestSettings({
      Rules: {
        AutoRerollInitiative: AutoRerollInitiativeOption.Prompt
      }
    });
    const promptReroll = jest.fn();
    runEncounter(promptReroll);
    expect(promptReroll).toBeCalled();
  });

  test("Automatic", () => {
    InitializeTestSettings({
      Rules: {
        AutoRerollInitiative: AutoRerollInitiativeOption.Automatic
      }
    });
    const promptReroll = jest.fn();
    Math.random = () => 1;
    const encounter = runEncounter(promptReroll);
    expect(encounter.Combatants()[0].Initiative()).toEqual(20);
    expect(encounter.Combatants()[1].Initiative()).toEqual(20);
  });
});
