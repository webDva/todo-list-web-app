// common backend
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

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

const PORT = process.env.PORT || '3000';
app.set('port', PORT);

/*
* Routes
*/

app.post('/createAccount', (req, res) => {
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
                    dbo.collection('accounts').insertOne({
                        account_id: uuidv4(),
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, 12),
                        type: "account"
                    }, (err, res) => { if (err) throw err; });

                    db.close();
                    return res.send({ success: true });
                }
            }, error => {
                return res.send({ error: true });
            });
    });
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

// Catch all other routes and return the index file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/index.html'));
});

// register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/register.html'));
});

// Start the HTTP server.
app.listen(PORT, (err) => {
    if (err) {
        return console.log('[UNEXPECTED MISTAKE] Something bad happened: ', err);
    }

    console.log(`Backend running on port ${PORT}`);
});