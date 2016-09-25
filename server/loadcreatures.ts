import fs = require('fs');

var importCreatureLibrary = (filename, creatures) => fs.readFile(filename, (err, buffer) => {
    if (err) {
        throw `Couldn't read creature library ${filename}: ${err}`;
    }

    var newCreatures = JSON.parse(buffer.toString());
    var args = [0, 0].concat(newCreatures);
    Array.prototype.splice.apply(creatures, args);
});

export default function(creatures){
    var argv = require('minimist')(process.argv.slice(2));

    if (argv.f) {
        fs.stat(argv.f, (err, stats) => {
            if (err) {
                throw `couldn't access ${argv.f}`;
            }
            if (stats.isDirectory()) {
                fs.readdir(argv.f, (err, fileNames) => {
                    if (err) {
                        throw `couldn't read directory ${argv.f}`;
                    }
                    fileNames.forEach(fileName => {
                        importCreatureLibrary(argv.f + '/' + fileName, creatures);
                    });
                })
            } else {
                importCreatureLibrary(argv.f, creatures);
            }
        })
    }
    else {
        importCreatureLibrary('ogl_creatures.json', creatures);
    }
}