import express from 'express';
import { renderToString } from 'react-dom/server';

import mongoose from 'mongoose';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'; 
import session from 'express-session';
import { StudentModel, GPDModel, UserModel } from './models';
import { ServerApp } from '../common/app';
import { fileURLToPath } from 'node:url';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');

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
}));





server.get('/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });



  function loggedIn(req, res, next) {
    if (req.user == undefined) {
      res.redirect('/login');
    } else {
      next();
        
    }
}


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
