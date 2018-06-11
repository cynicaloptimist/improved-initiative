import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { buildEncounter } from "./buildEncounter";

describe("Combatant", () => {
    let encounter: Encounter;
    beforeEach(() => {
        
        InitializeSettings();
        encounter = buildEncounter();
    });
    
    test("Should have its Max HP set from the statblock", () => {
        const combatant = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), HP: { Value: 10, Notes: "" } });
    
        expect(combatant.MaxHP).toBe(10);
    });

    test("Should update its Max HP when its statblock is updated", () => {
        const combatant = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), Player: "player" });
    
        combatant.StatBlock({ ...StatBlock.Default(), HP: { Value: 15, Notes: "" } });
        expect(combatant.MaxHP).toBe(15);
    });

    test("Should notify the encounter when its statblock is updated", () => {
        const combatant = encounter.AddCombatantFromStatBlock({ ...StatBlock.Default(), Player: "player" });
        const combatantsSpy = jest.fn();
        encounter.Combatants.subscribe(combatantsSpy);
    
        combatant.StatBlock({ ...StatBlock.Default(), HP: { Value: 15, Notes: "" } });
        expect(combatantsSpy).toBeCalled();
    });
});