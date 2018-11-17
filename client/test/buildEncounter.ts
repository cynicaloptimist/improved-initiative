import { Encounter } from "../Encounter/Encounter";
import { SpellLibrary } from "../Library/SpellLibrary";
import { PlayerViewClient } from "../Player/PlayerViewClient";
import { DefaultRules, IRules } from "../Rules/Rules";
import { TextEnricher } from "../TextEnricher/TextEnricher";
import { TrackerViewModel } from "../TrackerViewModel";

export function buildStatBlockTextEnricher(rules: IRules) {
    return new TextEnricher(jest.fn(), jest.fn(), jest.fn(), new SpellLibrary(null), rules);
}

export function buildEncounter() {
    window["$"] = require("jquery");
    const mockIo: any = {
        on: jest.fn(),
        emit: jest.fn()
    };

    const rules = new DefaultRules();
    const enricher = buildStatBlockTextEnricher(rules);
    const encounter = new Encounter(null, new TrackerViewModel(mockIo));
    return encounter;
}