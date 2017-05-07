module ImprovedInitiative {
    export interface Spell {
        Id: string;
        Name: string;
        Level: number;
        School: string;
        CastingTime: string;
        Range: string;
        Components: string;
        Duration: string;
        Classes: string[];
        Description: string;
        Ritual: boolean;
    }

    export class Spell {
        static GetKeywords = (spell: Spell) => [spell.Name, spell.School, ...spell.Classes].join(" ");

        static Default: () => Spell = () => {
            return {
                Id: probablyUniqueString(),
                Name: "",
                CastingTime: "",
                Classes: [],
                Components: "",
                Description: "",
                Duration: "",
                Level: 0,
                Range: "",
                Ritual: false,
                School: "",
            };
        };
    }
}