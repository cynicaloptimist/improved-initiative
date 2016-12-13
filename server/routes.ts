import express = require('express');

var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');

var pageRenderOptionsWithEncounterId = (encounterId: string) => ({
    rootDirectory: "..",
    encounterId: encounterId,
    appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || ''
});

var probablyUniqueString = (): string => {
    var chars = '1234567890abcdefghijkmnpqrstuvxyz';
    var probablyUniqueString = ''
    for (var i = 0; i < 8; i++) {
        var index = Math.floor(Math.random() * chars.length);
        probablyUniqueString += chars[index];
    }
    
    return probablyUniqueString;
}

var initializeNewPlayerView = (playerViews) => {
    var encounterId = probablyUniqueString();
    playerViews[encounterId] = {};
    return encounterId;
}

export default function (app: express.Express, creatures, playerViews) {
    let mustacheEngine = mustacheExpress();
    if (process.env.NODE_ENV === "development") {
        mustacheEngine.cache._max = 0;
    }
    app.engine('html', mustacheEngine);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/html');

    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json());

    app.get('/', function(req, res) {
        res.render('landing', pageRenderOptionsWithEncounterId(initializeNewPlayerView(playerViews)));
    });

    app.get('/e/:id', (req, res) => {
        console.log('app.get ' + req.path);
        res.render('tracker', pageRenderOptionsWithEncounterId(req.params.id));
    });

    app.get('/p/:id', (req, res) => {
        console.log('app.get ' + req.path);
        res.render('playerview', pageRenderOptionsWithEncounterId(req.params.id));
    });

    app.get('/playerviews/:id', (req, res) => {
        res.json(playerViews[req.params.id]);
    });

    app.get('/templates/:name', (req, res) => {
        res.render(`templates/${req.params.name}`, {
            rootDirectory: "..",
        });
    });

    let creatureList = creatures.map((creature, index) => {
            return { "Id": index, "Name": creature.Name, "Type": creature.Type, "Link": `/creatures/${index}` }
    });
    app.get('/creatures/', (req, res) => {
        res.json(creatureList);
    });

    app.get('/creatures/:id', (req, res) => {
        res.json(creatures[req.params.id]);
    });
}