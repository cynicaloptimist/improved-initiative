import fs = require("fs");
import path = require("path");

const sourceAbbreviations = {
    "monster-manual": "mm",
    "players-handbook": "phb"
};

//Lowercase, replace whitespace with dashes, remove non-word characters.
const formatStringForId = (str: string) => str.toLocaleLowerCase().replace(/[\s]/g, "-").replace(/[^a-z0-9-]/g, "");

const createId = (name: string, source: string) => {
    const sourceString = formatStringForId(source);
    const sourcePrefix = sourceAbbreviations[sourceString] || sourceString;
    const lowerCaseName = formatStringForId(name);
    return `${sourcePrefix}.${lowerCaseName}`;
};

export interface LibraryItem {
    Version: string;
    Name: string;
    Id: string;
    Source: string;
}

export interface Listing {
    Id: string;
    Link: string;
    Name: string;
    SearchHint: string;
}

export interface StatBlock extends LibraryItem {
    Type: string;
}

export const GetStatBlockKeywords = (statBlock: StatBlock) => statBlock.Type.toLocaleLowerCase().replace(/[^\w\s]/g, "");

export interface Spell extends LibraryItem {
    School: string;
    Classes: string[];
}

export const GetSpellKeywords = (spell: Spell) => [...spell.Classes, spell.School].join(" "); 

interface Combatant {
    Alias: string;
}
export interface SavedEncounter extends LibraryItem {
    Combatants: Combatant [];
}

export const GetEncounterKeywords = (encounter: SavedEncounter) => (encounter.Combatants || []).map(c => c.Alias).join(" "); 

export class Library<TItem extends LibraryItem> {
    private items: { [id: string]: TItem } = {};
    private listings: Listing[] = [];
    
    constructor(private route: string, private getKeywords: (item: TItem) => string) { }

    public static FromFile<I extends LibraryItem>(filename: string, route: string, getKeywords: (item: I) => string): Library<I> {
        const library = new Library<I>(route, getKeywords);

        const filePath = path.join(__dirname, "..", filename);

        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                throw `Couldn't read ${filePath} as a library: ${err}`;
            }

            const newItems: any [] = JSON.parse(buffer.toString());
            library.Add(newItems);
        });

        return library;
    }

    private Add(items: any []) {
        items.forEach(c => {
            if (!(c.Name && c.Source)) {
                throw `Missing Name or Source: Couldn't import ${JSON.stringify(c)}`;
            }
            c.Id = createId(c.Name, c.Source);
            this.items[c.Id] = c;
            const listing: Listing = {
                Name: c.Name,
                Id: c.Id,
                SearchHint: this.getKeywords(c),
                Link: this.route + c.Id
            };
            this.listings.push(listing);
        });
    }

    public GetById(id: string): TItem {
        return this.items[id];
    }

    public GetListings(): Listing[] {
        return this.listings;
    }

    public Route = () => this.route;
}