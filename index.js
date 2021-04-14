const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session');
const mongodbsession = require('connect-mongodb-session')(session);
const err= require('./Controllers/Error')
const authRoute=require('./Routes/Auth');
const User = require('./Models/User')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000
const store = new mongodbsession({
    uri: process.env.mongoURL,
    conllection: 'session'
});

app.set('view engine', 'ejs');
app.set('views', './Views')
app.use(express.static(__dirname + '/Public/'));
app.use('/images', express.static(path.join(__dirname, 'Public/images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "this is most secret thing",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById({ _id: req.session.user._id }).then(user => {
        req.user = user;
        next();
    });
});

app.use((req, res, next) => {
    res.locals.isAuthenticted = req.session.isLoggedin;
    next();
})

app.use('/auth',authRoute);

app.use(err.get404);

// app.use(err.get500);


mongoose.connect(process.env.mongoURL, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connected");
});
app.listen(PORT,()=>{
    console.log(`server started at http://127.0.0.1:${PORT}`);
})