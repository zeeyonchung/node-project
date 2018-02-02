'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: './uploads', limits: {filesize: 3 * 1024 * 1024} }); //3MB


var routes_vote = require('./app/routes/routes_vote.js');
var routes_pin = require('./app/routes/routes_pin.js');

/* // for jquery
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);
*/

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/js', express.static(process.cwd() + '/node_modules/jquery/dist'));
app.use('/js', express.static(process.cwd() + '/node_modules/tether/dist/js'));
app.use('/js', express.static(process.cwd() + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(process.cwd() + '/node_modules/bootstrap/dist/css'));
app.use('/uploads', express.static(process.cwd() + '/uploads'));

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//app.use(upload.any());
app.use(upload.single('imgPath'));
//https://github.com/expressjs/multer

routes(app, passport);
routes_vote(app, passport);
routes_pin(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
