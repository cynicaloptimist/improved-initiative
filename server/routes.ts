import express = require('express');

import bodyParser = require('body-parser');
import mustacheExpress = require('mustache-express');
import session = require('express-session');

import StatBlockLibrary from './statblocklibrary';

const pageRenderOptions = (encounterId: string) => ({
    rootDirectory: "..",
    encounterId: encounterId,
    appInsightsKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '',
    postedEncounter: null
});

const probablyUniqueString = (): string => {
    const chars = '1234567890abcdefghijkmnpqrstuvxyz';
    let probablyUniqueString = ''
    for (let i = 0; i < 8; i++) {
        const index = Math.floor(Math.random() * chars.length);
        probablyUniqueString += chars[index];
    }
    
    return probablyUniqueString;
}

const initializeNewPlayerView = (playerViews) => {
    const encounterId = probablyUniqueString();
    playerViews[encounterId] = {};
    return encounterId;
}

export default function (app: express.Express, statBlockLibrary: StatBlockLibrary, playerViews) {
    let mustacheEngine = mustacheExpress();
    if (process.env.NODE_ENV === "development") {
        mustacheEngine.cache._max = 0;
    }
    app.engine('html', mustacheEngine);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/html');

    app.use(express.static(__dirname + '/public'));
    app.use(session({
        secret: process.env.SESSION_SECRET || probablyUniqueString(),
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded())

    app.get('/', function(req, res) {
        res.render('landing', pageRenderOptions(initializeNewPlayerView(playerViews)));
    });

    app.get('/e/:id', (req, res) => {
        const session: any = req.session;
        const options = pageRenderOptions(req.params.id);
        if(session.postedEncounter){
            options.postedEncounter = JSON.stringify(session.postedEncounter);
        }
        res.render('tracker', options);
    });

    app.get('/p/:id', (req, res) => {
        res.render('playerview', pageRenderOptions(req.params.id));
    });

    app.get('/playerviews/:id', (req, res) => {
        res.json(playerViews[req.params.id]);
    });

    app.get('/templates/:name', (req, res) => {
        res.render(`templates/${req.params.name}`, {
            rootDirectory: "..",
        });
    });

    app.get('/statblocks/', (req, res) => {
        res.json(statBlockLibrary.GetStatBlockListings());
    });

    app.get('/statblocks/:id', (req, res) => {
        res.json(statBlockLibrary.GetStatBlockById(req.params.id));
    });

    const importEncounter = (req, res) => {
        const newViewId = initializeNewPlayerView(playerViews);
        const session: any = req.session;

        if(typeof req.body.Combatants === "string"){
            session.postedEncounter = { Combatants: JSON.parse(req.body.Combatants) }
        } else {
            session.postedEncounter = req.body;
        }
        
        res.redirect('/e/' + newViewId)
    };
    
    app.post('/launchencounter/', importEncounter);
    app.post('/importencounter/', importEncounter);
}