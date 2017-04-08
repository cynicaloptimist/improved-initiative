module ImprovedInitiative {
    export interface Spell {
        Name: string;
        Level: number;
        School: string;
        Time: string;
        Range: string;
        Components: string;
        Duration: string;
        Classes: string[];
        Content: string;
        Ritual: boolean;
    }

    export class Spell {
        static Default: () => Spell = () => {
            return { Name: "", Level: 0, School: "", Time: "", Range: "", Components: "", Duration: "", Classes: [], Content: "", Ritual: false };
        }
    }
}