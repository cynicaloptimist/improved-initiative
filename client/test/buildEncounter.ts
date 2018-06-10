import { PromptQueue } from "../Commands/Prompts/PromptQueue";
import { Encounter } from "../Encounter/Encounter";
import { DefaultRules } from "../Rules/Rules";
import { StatBlockTextEnricher } from "../StatBlock/StatBlockTextEnricher";

export function buildEncounter() {
    const rules = new DefaultRules();
    const enricher = new StatBlockTextEnricher(jest.fn(), jest.fn(), jest.fn(), null, rules);
    const encounter = new Encounter(new PromptQueue(), null, jest.fn().mockReturnValue(null), jest.fn(), rules, enricher);
    return encounter;
}