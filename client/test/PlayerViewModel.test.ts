import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { env } from "../Environment";
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

    test("Advancing the turn splashes combatant portraits when available", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant1.png" });
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant2.png" });
        playerViewModel.LoadEncounter(encounter.SavePlayerDisplay());
        
        env.HasEpicInitiative = true;
        const settings = CurrentSettings();
        settings.PlayerView.DisplayPortraits = true;
        settings.PlayerView.SplashPortraits = true;
        playerViewModel.LoadSettings(settings.PlayerView);
        
        expect(playerViewModel.imageModal().Visible).toBe(false);

        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.SavePlayerDisplay());

        expect(playerViewModel.imageModal().Visible).toBe(true);
    });
});
