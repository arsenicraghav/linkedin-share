'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var linkedin_api = require('./routes/linkedin-api');
var config = require('./config');


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, authorization, content-type');
    next();
});

app.options('*', function (req, res) {
    res.send(200);
});
app.get('/', function (req, res) {
    res.render('index', {payload: { count: '0', sharedPostUrl : '#'}});
});

app.get('/share/:id/:firstname/:lastname/:email', linkedin_api.share);

app.get('/callback', linkedin_api.redirect_callback);

app.use(function (req, res) {
    res.status(404).send('Resource not found');
});

app.listen(process.env.PORT || config.port, config.host, function() {
    console.log("Server started!");
});

