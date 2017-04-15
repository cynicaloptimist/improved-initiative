import fs = require("fs");

import { StatBlock, StatBlockListing } from './StatBlock'

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
            c.Id = createId(c.Name, c.Source);
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