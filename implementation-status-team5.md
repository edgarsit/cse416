# Implementation Status

## Login Page with Google and Local login

In order to implement login with both google and local authentication we used the express modules of sessions and passport. This made it so that if the home page or other pages from the MAST system are trying to be accessed prior to logging in they will be redirected to the login page. The user can either enter their username and password or select the sign in with google link to login with a google account. With the local login the entered credentials will be checked against the database, if a record has a matching username and password then the user will be redirected depending on their user type, GPD or student. If a matching record is not found then the user will be redirected back to the login page with an associated message. For google login the authentication check consits of taking the email and finding an associated record with the same email as the username of the record. If the email is not found then the user is redirected back to the login page with a message that says the google account used is not associated with a MAST account. If the login is succesful the user is redirected to the correct home page. In order for google authentication to work the gmail account being used must already be in the database in the username feild.


## Delete All Data

This was implemented by using a button from the GPD home page which links to a post method which runs an empty deleteMany monogoDB query on our student model, deleting all records.
