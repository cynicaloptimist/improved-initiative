import * as io from "socket.io-client";

import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { DefaultRules } from "../Rules/Rules";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";
import { Store } from "../Utility/Store";

describe("Encounter", () => {
    test("A new Encounter has no combatants", () => {
        const enricher = new StatBlockTextEnricher(
            jest.fn(),
            jest.fn(),
            jest.fn(),
            null,
            new DefaultRules()
        );
    
        const encounter = new Encounter(
            new PromptQueue(),
            io(),
            null, null,
            new DefaultRules(),
            enricher
        );

        expect(encounter.Combatants().length).toBe(0);
    });    
});