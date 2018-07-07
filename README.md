# To-do list web app

Prototype for a full-stack to-do list web application.

## To setup and install

1. Run the terminal command `npm install` in the root directory to install the `node_modules` directory.
2. Install a local MongoDB server for the database. For instance, you can go here to find out how to install MongoDB on Windows: [https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/).

## To run locally

1. Run the terminal command `"C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"` (or wherever `mongod.exe` may be installed) to run the MongoDB for the server to work.
2. Optionally, run the terminal command `"C:\Program Files\MongoDB\Server\3.6\bin\mongo.exe"` to access the database's contents.
3. Run the terminal command `node --inspect server.js` (`--inspect` for debugging) to start the server.
4. The server is now available to be accessed at the URL `http://localhost:3000`.