import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { SpellLibrary } from "../Library/SpellLibrary";
import { DefaultRules, IRules } from "../Rules/Rules";
import { TextEnricher } from "../TextEnricher/TextEnricher";

export function buildStatBlockTextEnricher(rules: IRules) {
    return new TextEnricher(jest.fn(), jest.fn(), jest.fn(), new SpellLibrary(null), rules);
}

export function buildEncounter() {
    const rules = new DefaultRules();
    const enricher = buildStatBlockTextEnricher(rules);
    const encounter = new Encounter(new PromptQueue(), null, jest.fn().mockReturnValue(null), jest.fn(), rules, enricher);
    return encounter;
}