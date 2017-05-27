import { probablyUniqueString } from "../Utility/Toolbox";
import { registerComponent } from "../Utility/Components";

export interface AbilityScores {
    Str: number;
    Dex: number;
    Con: number;
    Cha: number;
    Int: number;
    Wis: number;
}

export interface NameAndModifier {
    Name: string;
    Modifier: number;
}

export interface ValueAndNotes {
    Value: number;
    Notes: string;
}

export interface NameAndContent {
    Name: string;
    Content: string;
    Usage?: string;
}

export interface StatBlock {
    Id: string;
    Name: string;
    Source: string;
    Type: string;
    HP: ValueAndNotes;
    AC: ValueAndNotes;
    Speed: string[];
    Abilities: AbilityScores;
    InitiativeModifier?: number;
    DamageVulnerabilities: string[];
    DamageResistances: string[];
    DamageImmunities: string[];
    ConditionImmunities: string[];
    Saves: NameAndModifier[];
    Skills: NameAndModifier[];
    Senses: string[];
    Languages: string[];
    Challenge: string;
    Traits: NameAndContent[];
    Actions: NameAndContent[];
    Reactions: NameAndContent[];
    LegendaryActions: NameAndContent[];
    Description: string;
    Player: string;
}

export class StatBlock {
    static Default = (): StatBlock => ({
        Id: probablyUniqueString(), Name: '', Source: '', Type: '',
        HP: { Value: 1, Notes: '1d1+0' }, AC: { Value: 10, Notes: '' },
        InitiativeModifier: 0,
        Speed: [],
        Abilities: { Str: 10, Dex: 10, Con: 10, Cha: 10, Int: 10, Wis: 10 },
        DamageVulnerabilities: [], DamageResistances: [], DamageImmunities: [], ConditionImmunities: [],
        Saves: [], Skills: [], Senses: [], Languages: [],
        Challenge: '',
        Traits: [],
        Actions: [],
        Reactions: [],
        LegendaryActions: [],
        Description: '',
        Player: ''
    });

    static readonly AbilityNames = ["Str", "Dex", "Con", "Cha", "Int", "Wis"];
}

registerComponent('defaultstatblock', params => params.statBlock);
registerComponent('activestatblock', params => params.statBlock);
    