# Implementation Status

## Login Page with Google and Local login

In order to implement login with both google and local authentication we used the express modules of sessions and passport. This made it so that if the home page or other pages from the MAST system are trying to be accessed prior to logging in they will be redirected to the login page. The user can either enter their username and password or select the signin with google link to login with a google account.
