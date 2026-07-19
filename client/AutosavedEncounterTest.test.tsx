import { renderHook, act } from "@testing-library/react-hooks";

import { TrackerViewModel } from "./TrackerViewModel";
import { io } from "socket.io-client";
import { EncounterState } from "../common/EncounterState";
import { CombatantState } from "../common/CombatantState";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import { LegacySynchronousLocalStore } from "./Utility/LegacySynchronousLocalStore";
import { CurrentSettings, InitializeSettings } from "./Settings/Settings";
import { useLibraries } from "./Library/Libraries";
import { MockAccountClient } from "./MockAccountClient";
import { InitializeTestSettings } from "./test/InitializeTestSettings";

function CombatantStateWithName(name: string): CombatantState {
  const statBlock = StatBlock.Default();
  statBlock.Name = name;
  return {
    Id: probablyUniqueString(),
    StatBlock: statBlock,
    Alias: "",
    IndexLabel: null,
    CurrentHP: statBlock.HP.Value,
    CurrentNotes: "",
    TemporaryHP: 0,
    Hidden: false,
    RevealedAC: false,
    Initiative: 0,
    Tags: [],
    RoundCounter: 0,
    ElapsedSeconds: 0,
    InterfaceVersion: process.env.VERSION || "unknown"
  };
}

describe("Autosaved Encounters", () => {
  it("loads simple combatants", async () => {
    InitializeTestSettings({
      PreloadedContent: {
        BasicRules: false,
        Open5eContent: false
      }
    });

    const encounter: EncounterState<CombatantState> = {
      ActiveCombatantId: null,
      RoundCounter: 0,
      ElapsedSeconds: 0,
      BackgroundImageUrl: null,
      SaveEncounterDefaults: {
        Name: "Goblin Ambush",
        Path: "Chapter 1"
      },
      Combatants: [CombatantStateWithName("1"), CombatantStateWithName("2")]
    };
    LegacySynchronousLocalStore.Save(
      LegacySynchronousLocalStore.AutoSavedEncounters,
      LegacySynchronousLocalStore.DefaultSavedEncounterId,
      encounter
    );

    const viewModel = new TrackerViewModel(io());

    const libraries = renderHook(() =>
      useLibraries(CurrentSettings(), MockAccountClient(), () => {})
    );

    viewModel.SetLibraries(libraries.result.current);
    viewModel.LoadAutoSavedEncounterIfAvailable();
    const combatants = viewModel.Encounter.Combatants();
    expect(combatants.map(c => c.DisplayName())).toEqual(["1", "2"]);
    expect(viewModel.Encounter.SaveEncounterDefaults()).toEqual({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
  });

  it("autosaves save defaults", () => {
    InitializeTestSettings({
      PreloadedContent: {
        BasicRules: false,
        Open5eContent: false
      }
    });
    const viewModel = new TrackerViewModel(io());
    const libraries = renderHook(() =>
      useLibraries(CurrentSettings(), MockAccountClient(), () => {})
    );
    viewModel.SetLibraries(libraries.result.current);
    viewModel.LoadAutoSavedEncounterIfAvailable();

    viewModel.Encounter.SaveEncounterDefaults({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });

    const autosavedEncounter = LegacySynchronousLocalStore.Load<
      EncounterState<CombatantState>
    >(
      LegacySynchronousLocalStore.AutoSavedEncounters,
      LegacySynchronousLocalStore.DefaultSavedEncounterId
    );
    expect(autosavedEncounter.SaveEncounterDefaults).toEqual({
      Name: "Goblin Ambush",
      Path: "Chapter 1"
    });
  });

  it.todo("loads persistent characters from account");
  it.todo("loads persistent characters from localAsync");
});
