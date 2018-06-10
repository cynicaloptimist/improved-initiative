import { PlayerView } from "../../common/PlayerView";
import { StatBlock } from "../../common/StatBlock";
import { PlayerViewModel } from "../PlayerViewModel";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "./buildEncounter";

describe("PlayerViewModel", () => {
    let playerViewModel: PlayerViewModel;
    beforeEach(() => {
        InitializeSettings();
        playerViewModel = new PlayerViewModel();
        const jquery = jest.genMockFromModule("jquery");
        window["$"] = jquery;
    });

    test("Setting the encounter populates combatants", () => {
        const encounter = buildEncounter();
        encounter.AddCombatantFromStatBlock(StatBlock.Default());
        const encounterState = encounter.SavePlayerDisplay();
        
        const playerView: PlayerView = {
            encounterState,
            settings: CurrentSettings().PlayerView
        };

        window["$"].ajax = jest.fn().mockReturnValue({
            done: c => c(playerView)
        });

        expect(playerViewModel.combatants().length).toBe(0);

        playerViewModel.LoadEncounterFromServer("snarf");
        
        expect(playerViewModel.combatants().length).toBe(1);
    });
});