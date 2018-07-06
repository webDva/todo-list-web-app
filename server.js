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

// load config and its constants
require('./config');

/*
 * API Server
 */

const app = express();
// Needed for POST requests.
app.use(bodyParser.json());

// session configuration
app.use(session({
    secret: 'single quoates',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: SECURE_COOKIES },
    name: COOKIENAME,
    store: new MongoStore({ url: DATABASEURI })
}));

const PORT = process.env.PORT || '3000';
app.set('port', PORT);

/*
* Routes
*/

// check if user's cookie is still saved in browser and user is not set, then automatically log the user out
app.use((req, res, next) => {
    if (req.session.cookie && !req.session.user) {
        res.clearCookie(COOKIENAME);
    }
    next();
});

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.session.cookie) {
        res.redirect('/todos');
    } else {
        next();
    }
};

// to prevent unauthorized sessions. users must be logged in
const validSessionChecker = (req, res, next) => {
    if (!req.session.user && !req.session.cookie) {
        return res.send({ success: false, reason: INVALID_SESSION });
    } else {
        next();
    }
};

// root
app.route('/')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'));
    });

// demo
app.route('/demo')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/demo.html'));
    });

// sign-up
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(path.join(__dirname, '/public/signup.html'));
    })
    .post((req, res) => {
        // validation
        if (req.body.username === '' || req.body.password === '') {
            return res.send({ success: false, reason: INVALID_INPUT });
        }

        MongoClient.connect(DATABASEURI + DATABASENAME, (err, db) => {
            if (err) throw err;

            const dbo = db.db(DATABASENAME);

            dbo.collection('accounts').findOne({ username: req.body.username }, (err, result) => {
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

                    // create a document to store the user's to-dos
                    dbo.collection('todo_lists').insertOne({
                        account_id: new_id,
                        username: req.body.username,
                        todos: [],
                        type: 'todo_list'
                    }, (err, result) => {
                        if (err) throw err;
                    });

                    // log the user in by creating a new session named "user" with the account_id as the value
                    req.session.user = new_id;

                    db.close();
                    return res.send({ success: true });
                }
            });
        });
    });

// user's dashboard
app.get('/todos', (req, res) => {
    if (req.session.user) {
        return res.sendFile(__dirname + '/public/todos.html');
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
        // validation
        if (req.body.username === '' || req.body.password === '') {
            return res.send({ success: false, reason: INVALID_INPUT });
        }

        MongoClient.connect(DATABASEURI + DATABASENAME, (err, db) => {
            if (err) throw err;

            const dbo = db.db(DATABASENAME);

            dbo.collection('accounts').findOne({ username: req.body.username }, (err, result) => {
                if (err) throw err;

                if (!result) { // non-existant account
                    db.close();
                    return res.send({ success: false, reason: NONEXISTANT_ACCOUNT });
                } else if (!bcrypt.compareSync(req.body.password, result.password)) { // wrong password
                    db.close();
                    return res.send({ success: false, reason: INCORRECT_PASSWORD });
                } else { // success
                    req.session.user = result.account_id;
                    db.close();
                    return res.send({ success: true });
                }
            });
        });
    });

// logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.session.cookie) {
        req.session.user = null;
        res.clearCookie(COOKIENAME);
        return res.redirect('/');
    } else {
        return res.redirect('/');
    }
});

//
// To-do list routes
//

app.get('/retrieveTodos', validSessionChecker, (req, res) => {
    MongoClient.connect(DATABASEURI + DATABASENAME, (err, db) => {
        if (err) throw err;
        const dbo = db.db(DATABASENAME);
        dbo.collection('todo_lists').findOne({ account_id: req.session.user }, (err, result) => {
            if (err) throw err;
            db.close();
            if (!result) return res.send({ success: false, reason: UNKNOWN_ERROR });
            return res.send({ success: true, todos: result.todos });
        });
    });
});

app.post('/updateTodos', validSessionChecker, (req, res) => {
    MongoClient.connect(DATABASEURI + DATABASENAME, (err, db) => {
        if (err) throw err;
        const dbo = db.db(DATABASENAME);
        dbo.collection('todo_lists').updateOne({ account_id: req.session.user }, { $set: { todos: req.body.todos } }, (err, result) => {
            if (err) throw err;
            db.close();
            return res.send({ success: true });
        });
    });
});

// retrieve account username
app.get('/retrieveUsername', validSessionChecker, (req, res) => {
    MongoClient.connect(DATABASEURI + DATABASENAME, (err, db) => {
        if (err) throw err;
        const dbo = db.db(DATABASENAME);
        dbo.collection('accounts').findOne({ account_id: req.session.user }, (err, result) => {
            if (err) throw err;
            db.close();
            if (!result) return res.send({ success: false, reason: UNKNOWN_ERROR });
            return res.send({ success: true, username: result.username });
        });
    });
});

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