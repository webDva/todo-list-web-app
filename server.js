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

const databasename = 'remindyouio_database'
const databaseuri = 'mongodb://localhost:27017/'

/*
 * API Server
 */

const app = express();
// Needed for POST requests.
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'single quoates',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 180000 },
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
        res.clearCookie('connect.sid');
    }
    next();
});

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.session.cookie) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

app.route('/')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/frontend/index.html'));
    });

app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/frontend/signup.html'));
    })
    .post((req, res) => {
        MongoClient.connect(databaseuri + databasename, (err, db) => {
            if (err) throw err;

            const dbo = db.db(databasename);

            dbo.collection('accounts').findOne({ email: req.body.email })
                .then(result => {
                    if (err) throw err;

                    // if an entry already exists, send an error to the client
                    if (result) {
                        db.close();
                        return res.send({ error: true });
                    } else {
                        const new_id = uuidv4();

                        dbo.collection('accounts').insertOne({
                            account_id: new_id,
                            email: req.body.email,
                            password: bcrypt.hashSync(req.body.password, 12),
                            type: "account"
                        }, (err, result) => {
                            if (err) throw err;
                        });

                        // log the user in
                        req.session.user = new_id;

                        db.close();
                        return res.send({ success: true });
                    }
                })
                .catch(error => {
                    return res.send({ error: true });
                });
        });
    });

app.route('/login')
    .post((req, res) => {
        MongoClient.connect(databaseuri + databasename, (err, db) => {
            if (err) throw err;

            const dbo = db.db(databasename);

            dbo.collection('accounts').findOne({ email: req.body.email })
                .then(result => {
                    if (err) throw err;

                    if (!result) {
                        return res.send({ error: true });
                    } else if (!bcrypt.compareSync(req.body.password, result.password)) {
                        return res.send({ error: true });
                    } else {
                        req.session.user = result.account_id;
                        return res.send({ success: true });
                    }
                });
        });
    });

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        return res.sendFile(__dirname + '/frontend/dashboard.html');
    } else {
        return res.redirect('/');
    }
});

/*
* Error Handling
*/

app.use(function (err, req, res, next) {
    // more than likely malformed json
    console.log("[ERROR] " + err);
    return res.send({ "failed": "nope.avi" });
});

/*
 * HTTP Server
 */

// Point static path to dist
app.use(express.static(path.join(__dirname, '/frontend')));

// Start the HTTP server.
app.listen(PORT, (err) => {
    if (err) {
        return console.log('[UNEXPECTED MISTAKE] Something bad happened: ', err);
    }

    console.log(`Backend running on port ${PORT}`);
});