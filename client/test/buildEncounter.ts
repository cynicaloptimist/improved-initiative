import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { SpellLibrary } from "../Library/SpellLibrary";
import { DefaultRules, IRules } from "../Rules/Rules";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";

export function buildStatBlockTextEnricher(rules: IRules) {
    return new StatBlockTextEnricher(jest.fn(), jest.fn(), jest.fn(), new SpellLibrary(null), rules);
}

export function buildEncounter() {
    const rules = new DefaultRules();
    const enricher = buildStatBlockTextEnricher(rules);
    const encounter = new Encounter(new PromptQueue(), null, jest.fn().mockReturnValue(null), jest.fn(), rules, enricher);
    return encounter;
}