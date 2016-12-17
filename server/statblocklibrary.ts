import fs = require('fs');

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
    "monster-manual": "mm"
}

const toLowerCaseWithDashes = (str: string) => str.toLocaleLowerCase().replace(/[\s]/g, '-').replace(/[^a-z0-9-]/g, '');

const createCreatureId = (creatureName: string, statblockSource: string) => {
    const sourceString = toLowerCaseWithDashes(statblockSource);
    const sourcePrefix = statblockSourceAbbreviations[sourceString] || sourceString;
    const statblockName = toLowerCaseWithDashes(creatureName);
    return `${sourcePrefix}.${statblockName}`;
}

export default class StatBlockLibrary {
    private _statBlocks: { [statBlockId: string]: StatBlock } = {};
    private _statBlockListings: StatBlockListing[] = [];

    static FromFile(filename: string): StatBlockLibrary {
        const library = new StatBlockLibrary();

        fs.readFile(filename, (err, buffer) => {
            if (err) {
                throw `Couldn't read creature library ${filename}: ${err}`;
            }

            var newCreatures = JSON.parse(buffer.toString());
            library.AddCreatures(newCreatures);
        });

        return library;
    }

    protected AddCreatures(creatures: StatBlock[]) {
        creatures.forEach(c => {
            c.Id = createCreatureId(c.Name, c.Source);
            this._statBlocks[c.Id] = c;
            this._statBlockListings.push({
                Id: c.Id,
                Name: c.Name,
                Type: c.Type,
                Link: '/creatures/' + c.Id
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