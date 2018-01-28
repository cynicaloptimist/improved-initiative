import { DurationTiming } from "../Combatant/Tag";
import { StatBlock } from "../StatBlock/StatBlock";
import { Listable } from "../../common/Listable";

export interface SavedCombatant {
    Id: string;
    StatBlock: StatBlock;
    MaxHP: number;
    CurrentHP: number;
    TemporaryHP: number;
    Initiative: number;
    InitiativeGroup?: string;
    Alias: string;
    IndexLabel: number;
    Tags: string[] | SavedTag[];
    Hidden: boolean;
    InterfaceVersion: string;
}
export interface SavedTag {
    Text: string;
    DurationRemaining: number;
    DurationTiming: DurationTiming;
    DurationCombatantId: string;
}

export interface SavedEncounter<T> extends Listable {
    ActiveCombatantId: string;
    RoundCounter?: number;
    Combatants: T[];
}

