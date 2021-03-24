import express from 'express';
import { renderToString } from 'react-dom/server';

import mongoose from 'mongoose';

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import session from 'express-session';
import { StudentModel, GPDModel, UserModel } from './models';
import { ServerApp } from '../common/app';

const html = (body: string) => `
  <!DOCTYPE html>
  <html>
    <head>
    </head>
    <body style='margin:0'>
      <div id='app'>${body}</div>
    </body>
    <script src='public/client.js' defer></script>
  </html>
`;

const port = 3000;
const server = express();

server.use(express.static('build'));

server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());

server.get('/loggedin', (req, res) => { // this is just temporary to show login was succesful
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <title>Login Page</title>
    <body>
        <h1> logged in </h1>
  </body>
    </html>
    `;
  res.write(html);
  res.end();
});

passport.use(new GoogleStrategy({
  clientID: '22365015952-9kp5umlqtu97p4q36cigscetnl7dn3be.apps.googleusercontent.com',
  clientSecret: 'xa-6Hj_veI1YnjYhuEIEkdAz',
  callbackURL: 'http://localhost:3000/auth/google/callback',
},

async (accessToken, refreshToken, profile, done) => {
  const newUser = {
    googleId: profile.id,
    displayName: profile.name?.givenName,
  };
  done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

server.get('/', passport.authenticate(['local', 'google'], {
  successRedirect: '/main',
  failureRedirect: '/login'
}))

server.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/loggedin');
  });

server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

function writeLogin(req: any, res: any) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <title>MAST Login Page</title>
    <style>
    a.button {
        -webkit-appearance: button;
        -moz-appearance: button;
        appearance: button;

        text-decoration: none;
        color: initial;
    }
    </style>
    </head>
    <body>
        <h1>MAST Login</h1>
        <a href="/auth/google" class="button">Sign in with Google</a>
  </body>
    </html>
    `;
  res.write(html);
  res.end();
}

function writeGPDHome(req,res) {
  res.setHeader("Content-Type", "text/html");

  
  let html = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <title> GPD Home </title>
  </head>

  <body>
      <h1> GPD Home </h1><br>
      <form action="/Scrape_Course_Information" method = "get">
          <button>Scrape Course Information</button>
      </form>
      <br>
      <form action="/Import_Course_Offerings" method = "get">
          <button>Import Course Offerings</button>
      </form>
      <br>
      <form action="/Delete_Student" method = "get">
          <button>Delete Student Data</button>
      </form>
      <br>
      <form action="/Import_Student_Data" method = "get">
          <button>Import Student Data</button>
      </form>
      <br>
      <form action="/Import_Grades" method = "get">
          <button>Import Grades</button>
      </form>
      <br>
      <form action="/Add_Student" method = "get">
          <button>Add Student</button>
      </form>
      <br>
      <form action="/Search_Students" method = "get">
          <button>Search Students</button>
      </form>
      <br>
  `;
 
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(html + "\n\n</body>\n</html>");
    res.end();
};

function writeSearch(req,res) {
  res.setHeader("Content-Type", "text/html");

  
  let html = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <title> Student Search </title>
  </head><body>
  <h1> Student Search </h1><br>
  
  <br>
`;
  res.writeHead(200, {"Content-Type": "text/html"});
  res.write(html + "\n\n</body>\n</html>");
  res.end();
};


server.get('/GPD_Home', (req, res) => {
  writeGPDHome(req,res);
});

server.get('/Search_Students', (req, res) => {
  writeSearch(req,res);
});

server.get('*', (req, res) => {
  const body = renderToString(ServerApp(req.url));
  res.send(
    html(
      body,
    ),
  );
});

(async () => {
  await mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'cse416',
  });
  mongoose.connection.db.dropDatabase();

  const { _id: id } = await StudentModel.create({
    userName: 'asd', password: 'asd', department: '', track: '', requirementVersion: '', gradSemester: '', coursePlan: '', graduated: false, comments: '', sbuId: 0,
  });
  const userName = 'asd';
  const password = 'asd';
  const r = await UserModel.findOne({ userName, password });
  console.log(r);

  server.listen(3000, () => console.log(`http://localhost:${port}/ !`));
})();
