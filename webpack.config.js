var path = require('path');

module.exports = {
    entry: './client/Tracker.tsx',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'improved-initiative.bundle.js'
    }
};