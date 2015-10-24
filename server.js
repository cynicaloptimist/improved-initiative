/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var port = process.env.PORT || 80;
var app = express();
var encounters = [];
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/');
app.use(express.static('public'));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    console.log('app.get /');
    res.render('index.html');
});
app.route('/encounters/:id')
    .get(function (req, res) {
    res.json(encounters[req.params.id]);
})
    .post(function (req, res) {
    encounters[req.params.id] = req.body;
    res.status(200).end();
});
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Improved Initiative listening at http://%s:%s', host, port);
});
//# sourceMappingURL=server.js.map