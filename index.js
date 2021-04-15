const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session');
const mongodbsession = require('connect-mongodb-session')(session);
const err = require('./Controllers/Error')
const authRoute = require('./Routes/Auth');
const User = require('./Models/User')
const home = require('./Routes/home')
require('dotenv').config();
const multer = require('multer')
const schedule = require('node-schedule');
const Job = require('./util/checkexpire')

const app = express();
const PORT = process.env.PORT || 3000
const store = new mongodbsession({
    uri: process.env.mongoURL,
    conllection: 'session'
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine', 'ejs');
app.set('views', './Views')
app.use(express.static(__dirname + '/Public/'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));
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
    // 0 0 */2 * * *
    res.locals.isAuthenticted = req.session.isLoggedin;
    schedule.scheduleJob('job', '0 0 */2 * * *', () => {
        Job(req.user);
        console.log('JOB Started!');
        // schedule.cancelJob('job')
    })
    next();
})


app.use('/auth', authRoute);
app.use('/', home)

app.use(err.get404);

app.use(err.get500);

mongoose.connect(process.env.mongoURL, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connected");
});
app.listen(PORT, () => {
    console.log(`server started at http://127.0.0.1:${PORT}`);
})