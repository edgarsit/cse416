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

We use the [Airbnb style](https://github.com/airbnb/javascript), enforced with ESLint and checked with GitHub Actions. There are exceptions defined for [createCourseSchedule.tsx](src/common/createCourseSchedule.tsx) and [degreeRequirementImport.tsx](src/common/degreeRequirementImport.tsx) due to issues in those files.

## 3. Implementation Status Report

See [implementation-grading-sheet-team5.xlsx](implementation-grading-sheet-team5.xlsx) and [implementation-status-team5.md](implementation-status-team5.md)

## 4. Installation Manual

See [installation-manual.md](installation-manual.md)

## 5. Test Report

See [test-report.md](test-report.md)

## 6. Contributions

- Ayoub Benchaita: Create the login page, wrote code for google authentication, local authentication, redirects assited with the status report and test report.

- Menachem Goldring: Helped with the reports, planning, and foundational code for some of the gpd functions.

- Nathaniel Kissoon: None

- Edgar Sit: Set up the base repo (npm package and scripts, webpack, Bootstrap, React, Typescript, and ESLint). Set up Github Actions to check build and ESLint compliance. Created DB models and set up Server Side Rendering for React. Wrote the frontend in src/common/ and src/client/. Wrote backend for editStudentInformation, addStudent, searchForStudent and deleteAll. Filled out implementation-grading-sheet.xlsx. Set up HTTPS. Wrote test for "Add Student is Persisted". Created video.

- Kevin Zheng:

## 7. Code and Data

This zip file was created from commit 6d3603633e7accf6bc33b8a82f2a4a85542fdbc2 from <https://github.com/edgarsit/cse416/tree/react>

## 8. Requirements and 9. Design

See [requirements-and-design.pdf](requirements-and-design.pdf)

## 10. Video

See the separate file
