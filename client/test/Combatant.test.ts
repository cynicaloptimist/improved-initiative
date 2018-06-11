import { StatBlock } from "../../common/StatBlock";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "./buildEncounter";

describe("Combatant", () => {
    beforeEach(() => {
        InitializeSettings();
    });
    
    test("Should have its Max HP set from the statblock", () => {
        const encounter = buildEncounter();
        const combatant = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
    
        expect(combatant.MaxHP).toBe(10);
    });

    test("Should update its Max HP when its statblock is updated", () => {
        const encounter = buildEncounter();
        const combatant = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), Player: "player" });
    
        combatant.StatBlock({ ...StatBlock.Default(), HP: { Value: 15, Notes: "" } });
        expect(combatant.MaxHP).toBe(15);
    });
});