import { buildEncounter } from "../Test/buildEncounter";

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
});