import fs = require("fs");

export interface StatBlock {
    Name: string;
    Id: string;
    Type: string;
    Source: string;
}

export interface StatBlockListing {
    Name: string;
    Id: string;
    Type: string;
    Link: string;
}

const statblockSourceAbbreviations = {
    "monster-manual": "mm",
};

const toLowerCaseWithDashes = (str: string) => str.toLocaleLowerCase().replace(/[\s]/g, "-").replace(/[^a-z0-9-]/g, "");

const createStatBlockId = (statBlockName: string, statblockSource: string) => {
    const sourceString = toLowerCaseWithDashes(statblockSource);
    const sourcePrefix = statblockSourceAbbreviations[sourceString] || sourceString;
    const statblockName = toLowerCaseWithDashes(statBlockName);
    return `${sourcePrefix}.${statblockName}`;
};

export default class StatBlockLibrary {
    private _statBlocks: { [statBlockId: string]: StatBlock } = {};
    private _statBlockListings: StatBlockListing[] = [];

    static FromFile(filename: string): StatBlockLibrary {
        const library = new StatBlockLibrary();

        fs.readFile(filename, (err, buffer) => {
            if (err) {
                throw `Couldn't read statBlock library ${filename}: ${err}`;
            }

            let newStatBlocks = JSON.parse(buffer.toString());
            library.AddStatBlocks(newStatBlocks);
        });

        return library;
    }

    protected AddStatBlocks(statBlocks: StatBlock[]) {
        statBlocks.forEach((c) => {
            c.Id = createStatBlockId(c.Name, c.Source);
            this._statBlocks[c.Id] = c;
            this._statBlockListings.push({
                Id: c.Id,
                Name: c.Name,
                Type: c.Type,
                Link: "/statblocks/" + c.Id,
            });
        });
    }

    public GetStatBlockById(id: string): StatBlock {
        return this._statBlocks[id];
    }

    public GetStatBlockListings(): StatBlockListing[] {
        return this._statBlockListings;
    }
}