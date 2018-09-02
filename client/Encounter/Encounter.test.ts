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

    describe("Initiative Ordering", () => {
        test("By roll", () => {
            const slow = encounter.AddCombatantFromStatBlock(StatBlock.Default());
            const fast = encounter.AddCombatantFromStatBlock(StatBlock.Default());
            expect(encounter.Combatants())
                .toEqual([slow, fast]);
    
            fast.Initiative(20);
            slow.Initiative(1);
            encounter.StartEncounter();
            expect(encounter.Combatants())
                .toEqual([fast, slow]);
        });

        test("By modifier", () => {
            const slow = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 0 });
            const fast = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 2 });
            encounter.StartEncounter();
            expect(encounter.Combatants())
                .toEqual([fast, slow]);
        });

        test("By group modifier", () => {
            const slow = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 0 });
            const fast = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 2 });
            const loner = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 1 });
            slow.InitiativeGroup("group");
            fast.InitiativeGroup("group");
            encounter.StartEncounter();

            expect(encounter.Combatants())
                .toEqual([fast, slow, loner]);
        });

        test("Favor player characters", () => {
            const creature = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default() });
            const playerCharacter = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), Player: "player" });
            encounter.StartEncounter();
            expect(encounter.Combatants())
                .toEqual([playerCharacter, creature]);
        });
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
});