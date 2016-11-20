import fs = require('fs');

var addCreaturesFromFile = (filename, creatures) => fs.readFile(filename, (err, buffer) => {
    if (err) {
        throw `Couldn't read creature library ${filename}: ${err}`;
    }

    var newCreatures = JSON.parse(buffer.toString());
    creatures.push.apply(creatures, newCreatures);
});

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