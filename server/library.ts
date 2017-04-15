import fs = require("fs");

const sourceAbbreviations = {
    "monster-manual": "mm",
};

const toLowerCaseWithDashes = (str: string) => str.toLocaleLowerCase().replace(/[\s]/g, "-").replace(/[^a-z0-9-]/g, "");

const createId = (name: string, source: string) => {
    const sourceString = toLowerCaseWithDashes(source);
    const sourcePrefix = sourceAbbreviations[sourceString] || sourceString;
    const lowerCaseName = toLowerCaseWithDashes(name);
    return `${sourcePrefix}.${lowerCaseName}`;
};

export interface LibraryItem {
    Name: string;
    Id: string;
    Type: string;
    Source: string;
}

export interface Listing {
    Name: string;
    Id: string;
    Type: string;
    Link: string;
}

export default class Library<TItem extends LibraryItem> {
    private items: { [id: string]: TItem } = {};
    private listings: Listing[] = [];

    constructor(private route: string) { };

    static FromFile<I extends LibraryItem>(filename: string, route: string): Library<I> {
        const library = new Library<I>(route);

        fs.readFile(filename, (err, buffer) => {
            if (err) {
                throw `Couldn't read ${filename} as a library: ${err}`;
            }

            let newItems: I [] = JSON.parse(buffer.toString());
            library.Add(newItems);
        });

        return library;
    }

    private Add(items: TItem[]) {
        items.forEach((c) => {
            c.Id = createId(c.Name, c.Source);
            this.items[c.Id] = c;
            const listing: Listing = {
                Name: c.Name,
                Id: c.Id,
                Type: c.Type,
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
}