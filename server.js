// "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"
// "C:\Program Files\MongoDB\Server\3.6\bin\mongo.exe"

// common backend
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// session middleware
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); // session store

// database
const MongoClient = require('mongodb').MongoClient;

// for creating user accounts
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcrypt');

/*
* MongoDB
*/

const databasename = 'todolistapp';
const databaseuri = 'mongodb://localhost:27017/';

/*
 * API Server
 */

const app = express();
// Needed for POST requests.
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// business application constants

const cookiename = 'todolist_webapp';

const ACCOUNT_COLLISION = 1;
const UNKNOWN_ERROR = 2;
const NONEXISTANT_ACCOUNT = 3;
const INCORRECT_PASSWORD = 4;

// session configuration
app.use(session({
    secret: 'single quoates',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 180000 },
    name: cookiename,
    store: new MongoStore({ url: databaseuri })
}));

const PORT = process.env.PORT || '3000';
app.set('port', PORT);

/*
* Routes
*/

// check if user's cookie is still saved in browser and user is not set, then automatically log the user out
app.use((req, res, next) => {
    if (req.session.cookie && !req.session.user) {
        res.clearCookie(cookiename);
    }
    next();
});

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.session.cookie) {
        res.redirect('/notes');
    } else {
        next();
    }
};

// root
app.route('/')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'));
    });

// sign-up
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/signup.html'));
    })
    .post((req, res) => {
        MongoClient.connect(databaseuri + databasename, (err, db) => {
            if (err) throw err;

            const dbo = db.db(databasename);

            dbo.collection('accounts').findOne({ username: req.body.username })
                .then(result => {
                    if (err) throw err;

                    // if an entry already exists, send an error to the client
                    if (result) {
                        db.close();
                        return res.send({ success: false, reason: ACCOUNT_COLLISION });
                    } else {
                        // create a new account in the mongo database
                        const new_id = uuidv4();
                        dbo.collection('accounts').insertOne({
                            account_id: new_id,
                            username: req.body.username,
                            password: bcrypt.hashSync(req.body.password, 12),
                            type: "account"
                        }, (err, result) => {
                            if (err) throw err;
                        });

                        // log the user in by creating a new session named "user" with the account_id as the value
                        req.session.user = new_id;

                        db.close();
                        return res.send({ success: true });
                    }
                })
                .catch(error => {
                    return res.send({ success: false, reason: UNKNOWN_ERROR });
                });
        });
    });

// user's dashboard
app.get('/notes', (req, res) => {
    if (req.session.user) {
        return res.sendFile(__dirname + '/public/notes.html');
    } else {
        return res.redirect('/');
    }
});

//
// Login and logout
//

//login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/login.html'));
    })
    .post((req, res) => {
        MongoClient.connect(databaseuri + databasename, (err, db) => {
            if (err) throw err;

            const dbo = db.db(databasename);

            dbo.collection('accounts').findOne({ username: req.body.username })
                .then(result => {
                    if (err) throw err;

                    if (!result) { // non-existant account
                        return res.send({ success: false, reason: NONEXISTANT_ACCOUNT });
                    } else if (!bcrypt.compareSync(req.body.password, result.password)) { // wrong password
                        return res.send({ success: false, reason: INCORRECT_PASSWORD });
                    } else { // success
                        req.session.user = result.account_id;
                        return res.send({ success: true });
                    }
                });
        });
    });

// logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.session.cookie) {
        req.session.user = null;
        res.clearCookie(cookiename);
        return res.send({ success: true });
    } else {
        return res.send({ success: false});
    }
});

//
// To-do list routes
//



/*
* Error Handling
*/

app.use(function (err, req, res, next) {
    // more than likely malformed json
    console.log("[ERROR] " + err);
    return res.send({ success: false, reason: UNKNOWN_ERROR });
});

/*
 * HTTP Server
 */

// Point static path to dist
app.use(express.static(path.join(__dirname, '/public')));

// Start the HTTP server.
app.listen(PORT, (err) => {
    if (err) {
        return console.log('[UNEXPECTED MISTAKE] Something bad happened: ', err);
    }

    console.log(`Backend running on port ${PORT}`);
});