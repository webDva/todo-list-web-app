const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    databaseuri = 'mongodb://localhost:27017/'; // remember to set the other condition for production
} else {
    
}

// business application constants

databasename = 'todolistapp';

cookiename = 'todolist_webapp';

ACCOUNT_COLLISION = 1;
UNKNOWN_ERROR = 2;
NONEXISTANT_ACCOUNT = 3;
INCORRECT_PASSWORD = 4;
INVALID_SESSION = 5;
INVALID_INPUT = 6;