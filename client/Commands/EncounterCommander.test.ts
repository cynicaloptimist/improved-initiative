import { buildEncounter } from "../test/buildEncounter";

import { EncounterCommander } from  "./EncounterCommander";
import {CurrentSettings, InitializeSettings} from "../Settings/Settings";
import { Encounter } from "../Encounter/Encounter";
import { StatBlock } from "../../common/StatBlock";

describe("Encounter", () => {
    let encounter: Encounter;
    let encounterCommander: EncounterCommander;
    beforeEach(() => {
        InitializeSettings();
        encounter = buildEncounter();
        encounter.StartEncounter();
    });

    test("Start empty encounter.", () => {
        expect(encounter.Combatants().length).toBe(0);
        expect(!encounter.ActiveCombatant())
    });

    test("Click Next Turn with no combatants.", () => {
        expect(!encounter.ActiveCombatant())
        encounterCommander.NextTurn();
        expect(encounter.RoundCounter() == 1);
    });

    test("Kickstart encounter after placing combatants.", () => {
        const combatant = encounter.AddCombatantFromStatBlock(StatBlock.Default());
        expect(!encounter.ActiveCombatant())
        combatant.Initiative(combatant.GetInitiativeRoll());
        encounterCommander.NextTurn();
        expect(encounter.RoundCounter() == 1);
        expect(encounter.Combatants()[0]).toBe(encounter.ActiveCombatant());

    });
});
