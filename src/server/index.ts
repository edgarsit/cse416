import express from 'express';
import { renderToString } from 'react-dom/server';

import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';

import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import session from 'express-session';
import { StudentModel, GPDModel, UserModel, User } from './models';
import { ServerApp } from '../common/app';
import { fileURLToPath } from 'node:url';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');

const url = require('url');

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

server.use(express.urlencoded({ extended: true }));
server.use(express.text());

server.use(express.static('build'));
server.use(bodyParser.json()); // support json encoded bodies
server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    UserModel.findOne({userName: username}, function(err, user) {
      if (err) { 
        return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      return done(null, user);
    });
  }
));

server.post('/auth', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));
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
  })
);

passport.use(new LocalStrategy(
  function (username: string, password: string, done: (arg0: any, arg1?: boolean | DocumentType<User>, arg2?: { message: string; }) => void) {
    UserModel.findOne({ userName: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));





server.get('/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  function loggedIn(req, res, next) {
    if (req.user == undefined) {
      res.redirect('/login');
    } else {
      next();
        
    }
}

function writeGPDHome(req, res) {
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
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(html + "\n\n</body>\n</html>");
  res.end();
};

function writeSearch(req,res){
  let query = url.parse(req.url, true).query
  let filter = query.filter? query.filter : "";
  let search = query.search? query.search : "";

  let html = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <title> Student Search </title>
  </head><body>
  <h1> Student Search </h1><br>
  <form action="/GPD_Home" method = "get">
          <button>Home</button>
  </form>
  <form method="get" action = "/Search_Students">
            <input type="text" name="search" value="">
            <b>in</b>
            <select name="filter">
                <option value="allFields">All Fields</option>
                <option value="userName">Username</option>
                <option value="sbu_id">SBU_ID</option>
                <option value="track">Track</option>
                <option value="graduationSemester">Graduation Semester</option>
            </select>
            <input type="submit" value="Submit">
            <br>
            Example searches: Joe, 112233445,
        </form>
        <br><br>
        <table>
            <tr>
                <th> Name </th>
                <th> Graduation Semester </th>
                <th> Number of Semesters in Program </th>
                <th> Satisfied </th>
                <th> Pending </th>
                <th> Unsatisfied </th>
            </tr>
  <br>
`; //idk how username is gonna be stored so example might be different
//also filter might need different options
//last three or four columns will be implemented later, can sub in with 0 values for now

//get Student Table : Select * from Student
let student_table={}// replace this with mongodb stuff
if(filter == "allFields") // this might have to be adjusted to match mongodb syntax, as well as updated if filters change
        student_table = `SELECT * FROM Student
            WHERE username   LIKE '%` + search + `%' OR
                track  LIKE '%` + search + `%' OR
                gradSemester  LIKE '%` + search + `%' OR
                sbu_Id  LIKE '%` + search + `%'`;
//sql to search usernames
else if (filter == "username")
  student_table = `SELECT * FROM Student
    WHERE username   LIKE '%` + search + `%';`;
//sql to search sbu id
else if (filter == "sbu_id")
  student_table = `SELECT * FROM Student
    WHERE sbuId   LIKE '%` + search + `%';
    ORDER BY sbuId`;
    
//sql to search track
else if (filter == "track")
  student_table = `SELECT * FROM Student
    WHERE track   LIKE '%` + search + `%';`;
//sql to reqVers
else if (filter == "graduationSemester")
  student_table = `SELECT * FROM Student
    WHERE graduated=FALSE AND graduationSemester   LIKE '%` + search + `%';`;

//run query on student table to get information
//add each row of information into the table with html+=`...` as a loop

  res.writeHead(200, {"Content-Type": "text/html"});
  res.write(html + "\n</table>\n\n</body>\n</html>");
  res.end();
};

function writeAddStudent(req,res){

  let html = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <title> Add Student </title>
  </head>

  <body>
      <h1> Add Student </h1><br>
      <form method="get" action = "/authorize">
          <span>Username: </span>
          <input type="text" name="username" value=""><br>
          <span>Password: </span>
          <input type="text" name="password" value=""><br>
          <input type="submit" value="Login">
      </form>
      <br><br>
  `;
};

server.get('/GPD_Home', (req, res) => {
  writeGPDHome(req, res);
});

server.get('/Add_Student', (req, res) => {
  writeAddStudent(req,res);
});

server.get('/Search_Students', (req, res) => {
  writeSearch(req,res);
});

passport.serializeUser((user, done) => {
  done(null, user as any);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

server.get("/login", (req, res) => {
  var html = 
  
  `
  <!DOCTYPE html>
  <html lang="en">
  <body>
  <div className='login'>
  <div>
    <a href="/auth/google" className="button">Sign in with Google</a>
  </div>
  Login
  <form action="/auth" method="post">
    <div>
        <label>Username:</label>
        <input type="text" name="username"/>
    </div>
    <div>
        <label>Password:</label>
        <input type="password" name="password"/>
    </div>
    <div>
        <input type="submit" value="Log In"/>
    </div>
</form>
  
</div>
</body>
</html>`
res.write(html);
res.end()

});

server.post('/login',
  (req, res) => {
    return passport.authenticate('local', {
      failureRedirect: '/login',
      successRedirect: '/'
    })(req, res)
  }
)
server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

server.get('*', loggedIn, (req, res, next) => {
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
