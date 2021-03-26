# Getting Started

To run this application, clone the repo, start the Mongo database

```sh
./bin/mongod.exe --dbpath data
```

and start the application with

```sh
npm i
npm start
```

## 1. Persistence

### 1.1 Data Model

We used a persistence framework, [Typegoose](https://typegoose.github.io/typegoose/), which is based upon [Mongoose](https://mongoosejs.com/) and [MongoDB](https://www.mongodb.com/). The data for this is stored in `src/server/models.ts`.

### 1.2 Queries

Filtering is implemented by sending a GET request with the filter parameters to the server. The server then turns that into a query to the database which is then sanitized and returned back to the client.

## 2. Code Conventions

We use the [Airbnb style](https://github.com/airbnb/javascript), enforced with ESLint and checked with GitHub Actions. There are currently some violations, but they should eventually be fixed.

## 3. Implementation Status Report

See <implementation-grading-sheet.xlsx> and <implementation-status-team5.md>

## 4. Installation Manual

See <installation-manual.md>

## 5. Test Report

See <test-report.md>

## 6. Contributions

- Ayoub Benchaita:

- Menachem Goldring:

- Nathaniel Kissoon: None

- Edgar Sit:

- Kevin Zheng:

## 7. Code and Data

This zip file was created from commit XXX from <https://github.com/edgarsit/cse416/tree/react>

## 8. Requirements and 9. Design

See <requirements_and_design.pdf>

## 10. Video

See the separate file
