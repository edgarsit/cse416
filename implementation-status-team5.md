# Implementation Status

## 5 Functionality For Graduate Program Director

### 5.1, 5.2, 5.3, 5.5 Scraping and Imports

Unimplemented, currently we are manually entering data into the database

### 5.4 Delete All Student Data

This was implemented by using a button from the GPD home page which links to a post method which runs an empty deleteMany MongoDB query on our student model, deleting all records.

### 5.7 Add Student

Implemented

### 5.8 Browse/Search for Students

Incomplete: sorting direction is still not done; filters currently reload the page instead of using AJAX; fields for incomplete parts of the model are shown as empty currently

### 5.9 View/Edit student information

Incomplete: the course plan page is not done; client side validation is incomplete but it is still validated server side

### 5.10 Suggest course plan

Unimplemented

### 5.11 Enrollment Trends

Unimplemented

## 5 Functionality for M.S. Students

Unimplemented

## 7 Other Requirements

### 7.1 Authentication

In order to implement login with both google and local authentication we used the express modules of sessions and passport. This made it so that if the home page or other pages from the MAST system are trying to be accessed prior to logging in they will be redirected to the login page. The user can either enter their username and password or select the sign in with google link to login with a google account. With the local login the entered credentials will be checked against the database, if a record has a matching username and password then the user will be redirected depending on their user type, GPD or student. If a matching record is not found then the user will be redirected back to the login page with an associated message. For google login the authentication check consists of taking the email and finding an associated record with the same email as the username of the record. If the email is not found then the user is redirected back to the login page with a message that says the google account used is not associated with a MAST account. If the login is successful the user is redirected to the correct home page. In order for google authentication to work the gmail account being used must already be in the database in the username field.

### 7.2 Concurrency

Yes

### 7.3 Ease of use

2/5, still needs work, especially on error paths

### 7.4 Multi-host operation

Yes; the system currently does not make a public address available however

### 7.5 Network security

Yes, self signed HTTPS

### 7.6 Robustness

System is vulnerable to specially crafted queries

### 7.7 Performance

Yes
