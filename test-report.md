# Test Report

## Add Student is Persisted

### Description

This test ensures that `Add Student` operates correctly

### Preconditions

User is logged in a GPD

### Flow of Events

1. User goes to `Add Student` page

2. User enters information to page and presses submit

    1. The browser type errors

3. System creates `Student` document in the database and redirects the user to the home page

    1. If the info is invalid, show an error

4. User may go to `Browse/search for students` to verify that the student has been added

### Outcome

The system currently passes this test if there are no errors. 2.1 and 3.1 are not satisfied


## Not Valid Login Denied

### Description

This test ensures that users with invalid usernames, passwords, or gmail accounts are not allowed to their respective home pages and the correct error message is shown. A flow follows local login, the b flow follows sign in with google.

### Preconditions

User is on login page.

### Flow of Events

1(a). The user enters incorrect an username and/or password.
 
1(b). The user selects sign in with google. 

2(a). The user clicks `log in` button.

2(b). The completes the google authentication process with the incorrect gmail account.

3(a). The user is redirected back to the login page with the message `Try again incorrect credentials` is displayed

3(b). The user is redirected back to the login page with the message `The Google Account used is not associated with a MAST Account

` is displayed

### Outcome

The system currently passes this test.
