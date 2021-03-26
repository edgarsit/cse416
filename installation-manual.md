# 4. Installation Manual

## 4.1 Dependencies

This repo uses MongoDB and Node.js

## 4.2 Installing MongoDB

Install the appropriate [MongoDB Community Server](https://www.mongodb.com/try/download/community) for your OS.

## 4.3 Install Node.js

Install [Node.js](https://nodejs.org/en/) for your OS.

## 4.4 Start Database

Make a empty directory to store the database files in:

```sh
mkdir data
```

Start the Mongo daemon with

```sh
./bin/mongod.exe --dbpath data
```

## 4.5 Start Server

Have npm install the dependencies with

```sh
npm i
```

and start the application with

```sh
npm start
```

A link to the location where you can open the client of the application should appear when the server starts
