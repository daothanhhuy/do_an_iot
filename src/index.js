const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const sass = require('node-sass');
const app = express();
const path = require('path');
const port = 3000;
const route = require('./routes');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const dbURI =
    'mongodb+srv://hackblack86:123@demo.gxocm.mongodb.net/DoAn?retryWrites=true&w=majority';
const host = '172.31.250.62'
async function connect() {
    try {
        await mongoose.connect(dbURI, {
            //useCreateIndex: true,
        });
        console.log('Connect successfully');
    } catch (error) {
        console.log('Failed to connect');
        connect();
    }
}

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 })


const cookieParser = require("cookie-parser");
const sessions = require('express-session');
// session
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});
var session;
// cookie parser middleware
app.use(cookieParser());
// method override
app.use(methodOverride('_method'));
connect();
// use urlencoded
app.use(
    express.urlencoded({
        extended: true,
    }),
);
// JSON
app.use(express.json());
// public file can be view via url
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));

//Template engine
// Using handlebars to view
app.engine(
    'hbs',
    handlebars.engine({
        extname: '.hbs',
        helpers: {
            checkCurrent: (a) => {
                if (a == 1) return true;
            },
            sum: function (a, b) {
                var c = parseInt(a) + parseInt(b);
                return c;
            },
        },
    }),
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// connect to route file
route(app);

// Start listening
app.listen(port, () => {
    console.log(`App listening on port ${host}:${port}`);
});
