const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    DATABASEURI = 'mongodb://localhost:27017/';
    SECURE_COOKIES = false;
} else {
    DATABASEURI = process.env.MONGOWHATEVER; // whatever it may be on a production server
    SECURE_COOKIES = true;
}

// business application constants

DATABASENAME = 'todolistapp';

COOKIENAME = 'todolist_webapp';

ACCOUNT_COLLISION = 1;
UNKNOWN_ERROR = 2;
NONEXISTANT_ACCOUNT = 3;
INCORRECT_PASSWORD = 4;
INVALID_SESSION = 5;
INVALID_INPUT = 6;