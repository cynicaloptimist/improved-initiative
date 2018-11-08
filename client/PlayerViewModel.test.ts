import { StatBlock } from "../common/StatBlock";
import { Encounter } from "./Encounter/Encounter";
import { env } from "./Environment";
import { PlayerViewModel } from "./PlayerViewModel";
import { CurrentSettings, InitializeSettings } from "./Settings/Settings";
import { buildEncounter } from "./test/buildEncounter";

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
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
    });

    test("Loading the encounter populates combatants", () => {
        expect(playerViewModel.combatants().length).toBe(0);

        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.combatants().length).toBe(1);
    });

    test("Starting the encounter splashes combatant portraits when available", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant1.png" });
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant2.png" });
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        env.HasEpicInitiative = true;
        const settings = CurrentSettings();
        settings.PlayerView.DisplayPortraits = true;
        settings.PlayerView.SplashPortraits = true;
        playerViewModel.LoadSettings(settings.PlayerView);

        expect(playerViewModel.imageModal().Visible).toBe(false);

        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.imageModal().Visible).toBe(true);
    });

    test("Making no change does not splash combatant portraits", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant1.png" });
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant2.png" });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        env.HasEpicInitiative = true;
        const settings = CurrentSettings();
        settings.PlayerView.DisplayPortraits = true;
        settings.PlayerView.SplashPortraits = true;
        playerViewModel.LoadSettings(settings.PlayerView);

        expect(playerViewModel.imageModal().Visible).toBe(false);

        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.imageModal().Visible).toBe(false);
    });

    test("Applying damage does not splash combatant portraits", () => {
        const combatant1 = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant1.png" });
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, ImageURL: "http://combatant2.png" });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        env.HasEpicInitiative = true;
        const settings = CurrentSettings();
        settings.PlayerView.DisplayPortraits = true;
        settings.PlayerView.SplashPortraits = true;
        playerViewModel.LoadSettings(settings.PlayerView);

        expect(playerViewModel.imageModal().Visible).toBe(false);

        combatant1.ApplyDamage(5);
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.imageModal().Visible).toBe(false);
    });

    test("Player HP is displayed", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, Player: "player" });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        expect(playerViewModel.combatants()[0].HPDisplay).toBe("10/10");
    });

    test("Creature HP is obfuscated", () => {
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        expect(playerViewModel.combatants()[0].HPDisplay).toBe("<span class='healthyHP'>Healthy</span>");
    });

    test("Creature HP setting actual HP", () => {
        const settings = CurrentSettings();
        settings.PlayerView.MonsterHPVerbosity = "Actual HP";
        playerViewModel.LoadSettings(settings.PlayerView);

        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        expect(playerViewModel.combatants()[0].HPDisplay).toBe("10/10");
    });

    test("Player HP setting obfuscated HP", () => {
        const settings = CurrentSettings();
        settings.PlayerView.PlayerHPVerbosity = "Colored Label";
        playerViewModel.LoadSettings(settings.PlayerView);

        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        expect(playerViewModel.combatants()[0].HPDisplay).toBe("<span class='healthyHP'>Healthy</span>");
    });

    test("Player View is only updated if next combatant is visible", () => {
        const visibleCombatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        visibleCombatant1.Initiative(20);

        const visibleCombatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        visibleCombatant2.Initiative(10);

        const hiddenCombatant = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        hiddenCombatant.Hidden(true);
        hiddenCombatant.Initiative(1);

        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.activeCombatantId()).toEqual(visibleCombatant1.Id);
        encounter.NextTurn();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.activeCombatantId()).toEqual(visibleCombatant2.Id);
        encounter.NextTurn();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.activeCombatantId()).toEqual(visibleCombatant2.Id);
        encounter.NextTurn();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());

        expect(playerViewModel.activeCombatantId()).toEqual(visibleCombatant1.Id);
    });

    test.skip("Player View round timer stops when encounter stops", () => {
        jest.useFakeTimers();
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, Player: "player" });
        encounter.StartEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        jest.advanceTimersByTime(10000); // 10 seconds
        encounter.EndEncounter();
        playerViewModel.LoadEncounter(encounter.GetPlayerView());
        expect(playerViewModel.turnTimer.Readout()).toBe("0:00");
    });
});
