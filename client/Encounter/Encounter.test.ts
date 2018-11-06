import { buildEncounter } from "../test/buildEncounter";

import { StatBlock } from "../../common/StatBlock";
import {CurrentSettings, InitializeSettings} from "../Settings/Settings";
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
        encounter.AddCombatantFromStatBlock(StatBlock.Default());
        expect(encounter.Combatants().length).toBe(1);
    });

    test("Combat should not be active", () => {
        expect(encounter.State()).toBe("inactive");
    });

    test("Initiative Ordering", () => {
        const slow = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        const fast = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        expect(encounter.Combatants()[0]).toBe(slow);

        fast.Initiative(20);
        slow.Initiative(1);
        encounter.StartEncounter();
        expect(encounter.Combatants()[0]).toBe(fast);
        expect(encounter.Combatants()[1]).toBe(slow);
    });

    test("Active combatant stays at top of order", () => {
        const settings = CurrentSettings();
        settings.PlayerView.ActiveCombatantOnTop = true;

        for (let i = 0; i < 5; i++) {
            let thisCombatant = encounter.AddCombatantFromStatBlock(StatBlock.Default());
            thisCombatant.Initiative(i);
        }

        encounter.StartEncounter();
        expect(encounter.Combatants()[0]).toBe(encounter.ActiveCombatant());

        for (let i = 0; i < 5; i++) {
            encounter.NextTurn();
            expect(encounter.Combatants()[0]).toBe(encounter.ActiveCombatant());
        }
    });

    test("Encounter turn timer stops when encounter ends", () => {
        jest.useFakeTimers();
        encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" }, Player: "player" });
        encounter.StartEncounter();
        jest.advanceTimersByTime(10000); // 10 seconds
        encounter.EndEncounter();
        expect(encounter.TurnTimer.Readout()).toBe("0:00");
    });
});