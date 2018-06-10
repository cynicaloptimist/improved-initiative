import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { PlayerViewModel } from "../PlayerViewModel";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "./buildEncounter";

const mockIo: any = {
    on: jest.fn(),
    emit: jest.fn()
};

describe("PlayerViewModel", () => {
    let playerViewModel: PlayerViewModel;
    let encounter: Encounter;
    beforeEach(() => {
        InitializeSettings();
        playerViewModel = new PlayerViewModel(mockIo);
        encounter = buildEncounter();
        
    });

    afterEach(() => {

    });

    test("Loading the encounter populates combatants", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });

        expect(playerViewModel.combatants().length).toBe(0);

        playerViewModel.LoadSettings(CurrentSettings().PlayerView);
        playerViewModel.LoadEncounter(encounter.SavePlayerDisplay());
        
        expect(playerViewModel.combatants().length).toBe(1);
    });
});
