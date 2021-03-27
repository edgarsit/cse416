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
