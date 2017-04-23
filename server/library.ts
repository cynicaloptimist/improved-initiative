import fs = require("fs");
import _ = require("lodash");

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
    Name: string;
    Id: string;
    Source: string;
}

export interface Listing {
    Name: string;
    Id: string;
    Keywords: string [];
    Link: string;
}

export interface StatBlock {
    Name: string;
    Id: string;
    Type: string;
    Source: string;
}

export const GetStatBlockKeywords = (statBlock: StatBlock) => statBlock.Type.replace(/[^\w\s]/g, "").split(" ");

export interface Spell {
    Name: string;
    Id: string;
    School: string;
    Classes: string[];
    Source: string;
}

export const GetSpellKeywords = (spell: Spell) => {
    return [ ...spell.Classes, spell.School]
};

export class Library<TItem extends LibraryItem> {
    private items: { [id: string]: TItem } = {};
    private listings: Listing[] = [];
    
    constructor(private route: string, private getKeywords: (item: TItem) => string []) { };

    static FromFile<I extends LibraryItem>(filename: string, route: string, getKeywords: (item: I) => string []): Library<I> {
        const library = new Library<I>(route, getKeywords);

        fs.readFile(filename, (err, buffer) => {
            if (err) {
                throw `Couldn't read ${filename} as a library: ${err}`;
            }

            const newItems: any [] = JSON.parse(buffer.toString());
            library.Add(newItems);
        });

        return library;
    }

    private Add(items: any []) {
        items.forEach((c) => {
            if (!(c.Name && c.Source)) {
                throw `Missing Name or Source: Couldn't import ${JSON.stringify(c)}`;
            }
            c.Id = createId(c.Name, c.Source);
            this.items[c.Id] = c;
            const listing: Listing = {
                Name: c.Name,
                Id: c.Id,
                Keywords: this.getKeywords(c),
                Link: this.route + c.Id,
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