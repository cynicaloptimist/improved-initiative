import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { DefaultRules } from "../Rules/Rules";
import { CurrentSettings, InitializeSettings } from "../Settings/Settings";
import { StatBlock } from "../StatBlock/StatBlock";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";
import { Store } from "../Utility/Store";

function buildEncounter() {
    const rules = new DefaultRules();
    const enricher = new StatBlockTextEnricher(jest.fn(), jest.fn(), jest.fn(), null, rules);
    const encounter = new Encounter(
        new PromptQueue(),
        null,
        jest.fn().mockReturnValue(null),
        jest.fn(),
        rules,
        enricher
    );

    return encounter;
}

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
});