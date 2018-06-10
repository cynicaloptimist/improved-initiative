import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { PlayerViewModel } from "../PlayerViewModel";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "./buildEncounter";

describe("PlayerViewModel", () => {
    let playerViewModel: PlayerViewModel;
    let encounter: Encounter;

    beforeEach(() => {
        InitializeSettings();

        const mockIo: any = {
            on: jest.fn(),
            emit: jest.fn()
        };
        
        playerViewModel = new PlayerViewModel(mockIo);
        encounter = buildEncounter();
        playerViewModel.LoadSettings(CurrentSettings().PlayerView);
        playerViewModel.LoadEncounter(encounter.SavePlayerDisplay());
    });

    test("Loading the encounter populates combatants", () => {
        expect(playerViewModel.combatants().length).toBe(0);

        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
        playerViewModel.LoadEncounter(encounter.SavePlayerDisplay());
        
        expect(playerViewModel.combatants().length).toBe(1);
    });
});
