import { buildEncounter } from "../test/buildEncounter";

import { StatBlock } from "../../common/StatBlock";
import { InitializeSettings } from "../Settings/Settings";
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
            expect(encounter.Combatants()[0]).toBe(slow);
    
            fast.Initiative(20);
            slow.Initiative(1);
            encounter.StartEncounter();
            expect(encounter.Combatants()[0]).toBe(fast);
            expect(encounter.Combatants()[1]).toBe(slow);
        });
        
        test("By group modifier", () => {
            const slow = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 0 });
            const fast = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 2 });
            const loner = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), InitiativeModifier: 1 });
            slow.InitiativeGroup("group");
            fast.InitiativeGroup("group");
            encounter.StartEncounter();
            expect(encounter.Combatants()[0]).toBe(fast);
            expect(encounter.Combatants()[1]).toBe(slow);
            expect(encounter.Combatants()[2]).toBe(loner);
        });
    });
});