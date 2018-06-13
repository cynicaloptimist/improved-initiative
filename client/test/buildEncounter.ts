import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { DefaultRules, IRules } from "../Rules/Rules";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";

export function buildStatBlockTextEnricher(rules: IRules) {
    return new StatBlockTextEnricher(jest.fn(), jest.fn(), jest.fn(), null, rules);
}

export function buildEncounter() {
    const rules = new DefaultRules();
    const enricher = buildStatBlockTextEnricher(rules);
    const encounter = new Encounter(new PromptQueue(), null, jest.fn().mockReturnValue(null), jest.fn(), rules, enricher);
    return encounter;
}