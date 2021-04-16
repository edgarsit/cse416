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

The system currently passes this test if there are no errors. 2.i and 3.i are not satisfied

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

3(b). The user is redirected back to the login page with the message `The Google Account used is not associated with a MAST Account` is displayed

### Outcome

The system currently passes this test.

## Browse Students and Delete All Data

### Description

This test ensures that the GPD can view students in the browse students page and delete all students from the system with the browse student page being updated accordingly.

### Preconditions

Logged in as GPD, students exists in the database.

### Flow of Events

1. The user clicks on the `Browse/Search for Students` button.

2. The user sees the students from the database listed in the table.

3. The user clicks the back button.

4. The user clicks on `Delete All Data`.

5. The user clicks on the `Browse/Search for Students` button.

6. The user should not see any students listed in the table.

### Outcome

The system currently passes this test.

## Search for Students

### Description

This test ensures that the GPD can view students in the browse students page and search for a specific student based on their chosen field.

### Preconditions

Logged in as GPD, students exists in the database.

### Flow of Events

1. The user clicks on the `Browse/Search for Students` button.

2. The user clicks on the `Filter` button

3. The user enters values for the fields they want to search by.

4. The user clicks on `Apply`.

5. The user sees the users that meet their search criteria.

### Outcome

The system currently passes this test.

## Scrape Course Information

### Description

This test ensures that scrape course information works

### Preconditions

Logged in as GPD

### Flow of Events

1. User clicks Imports

2. User selects a PDF file, semester and year

3. User selects which departments they want to select

4. User presses "5.1 Scrape Course Information"

5. System scrapes the pdf and adds it to the database

6. User is redirected to the home screen

7. User check in console that the database has been updated

### Outcome

The system currently passes this test. The error case doesn't show an exact error (page and context); the system does not optimistically parse the PDF on the client side

## Import Course Offerings

### Description

This test ensures that import course offerings works

### Preconditions

Logged in as GPD

### Flow of Events

1. User clicks Imports

2. User selects a CSV file

3. User presses "5.3 Import Course Offerings"

4. System scrapes the CSV

5. System removes existing course offerings

6. System adds scraped offerings to the database

7. System invalidates course plans that become invalid

8. User is redirected to the home screen

9. User check in console that the database has been updated

### Outcome

The system currently passes this test except step 7. The course plan data model is not yet complete.

## Import Student Data

### Description

This test ensures that import student data works

### Preconditions

Logged in as GPD

### Flow of Events

1. User clicks Imports

2. User selects 2 CSV files

3. User presses "5.5 Import student data"

4. System scrapes the CSVs

5. System upserts the student data

6. System removes the course plan information for the scraped students

7. System adds the course plan file data

8. User is redirected to the home screen

9. User verifies on "Browse/search for students" that the students has been added

10. User check in console that the database has been updated with the new course plans

### Outcome

The system currently passes this test.

## Import Grades

### Description

This test ensures that import grades works

### Preconditions

Logged in as GPD

### Flow of Events

1. User clicks Imports

2. User selects a CSV file

3. User presses "5.6 Import grades"

4. System scrapes the CSV

5. System adds the grades

6. User is redirected to the home screen

7. User check in console that the database has been updated with the new grades

### Outcome

The system currently passes this test.
