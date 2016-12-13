import fs = require('fs');

const addCreaturesFromFile = (filename, creatures) => fs.readFile(filename, (err, buffer) => {
    if (err) {
        throw `Couldn't read creature library ${filename}: ${err}`;
    }

    var newCreatures = JSON.parse(buffer.toString());
    newCreatures.forEach(newCreature => {
        newCreature.Id = createCreatureId(newCreature.Name, newCreature.Source);
        creatures[newCreature.Id] = newCreature;
    })
});

const statblockSourceAbbreviations = {
    "system-reference-document": "srd"
}

const toLowerCaseWithDashes = (str: string) => str.toLocaleLowerCase().replace(/[\s]/g, '-').replace(/[^a-z0-9-]/g, '');

const createCreatureId = (creatureName: string, statblockSource: string) => {
    const sourceString = toLowerCaseWithDashes(statblockSource);
    const sourcePrefix = statblockSourceAbbreviations[sourceString] || sourceString;
    const statblockName = toLowerCaseWithDashes(creatureName);
    return `${sourcePrefix}~${statblockName}`;
}

export default function(creatures){
    var path = require('minimist')(process.argv.slice(2)).f;
    
    if (path) {
        fs.stat(path, (err, stats) => {
            if (err) {
                throw `couldn't access ${path}`;
            }
            if (stats.isDirectory()) {
                fs.readdir(path, (err, fileNames) => {
                    if (err) {
                        throw `couldn't read directory ${path}`;
                    }
                    fileNames.forEach(fileName => {
                        addCreaturesFromFile(path + '/' + fileName, creatures);
                    });
                })
            } else {
                addCreaturesFromFile(path, creatures);
            }
        })
    }
    
    else {
        addCreaturesFromFile('ogl_creatures.json', creatures);
    }
}