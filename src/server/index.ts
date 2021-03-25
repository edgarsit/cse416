import express from 'express';
import { renderToString } from 'react-dom/server';

import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { StudentModel, UserModel, User, GPDModel } from './models';
import { ServerApp, ServerSearchForStudent } from '../common/app';
import { URL } from 'url';
import { cols } from '../common/searchForStudent';

const html = (body: string, val?: any) => {
  const v = val != undefined ? `    <script>window._v = ${JSON.stringify(val)}</script>` : '';
  return `
  <!DOCTYPE html>
  <html>
    <head>
    <link
      rel="stylesheet"
      href="/public/bootstrap.min.css"
      integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
      crossorigin="anonymous"
    />
${v}
    <script src='public/client.js' defer></script>
    </head>
    <body style='margin:0'>
      <div id='app'>${body}</div>
    </body>
  </html>
`};

const port = 3000;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.text());

server.use(express.static('build'));
server.use('/public', express.static('public'));

server.set('query parser', 'simple')

server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());

passport.use(new LocalStrategy(
  function (username, password, done) {
    UserModel.findOne({ userName: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      return done(null, user);
    });
  }
));

server.post('/auth', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

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

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

server.get('/', (req, res) => {
  if (req.user) {
    if ((req.user as any).__t === 'GPD') {
      res.redirect('home')
    } else {
      res.redirect('home')
    }
  } else {
    res.redirect('/login')
  }
})

server.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
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

function writeAddStudent(req, res) {

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
  writeAddStudent(req, res);
});

// TODO fix
const getQS = (originalURL: string): any => {
  const params = new URL(originalURL, 'http://localhost').searchParams;
  const r: any = {}
  for (const k of Object.keys(cols)) {
    const v = params.get(k);
    // TODO Fix hack
    if (v != null && v !== '' && v != 'Ignore') {
      r[k] = v
    }
  }
  return r
}

server.get('/searchForStudent', async (req, res) => {
  // TODO fix sec
  const s = await StudentModel.find(getQS(req.originalUrl));
  const values = s.map((v) =>
    [
      v.userName,
      0, 0, 0,
      v.gradSemester,
      0,
      0,
      0,
    ]
  );
  // TODO Fix qs
  const body = renderToString(ServerSearchForStudent(req.url, { values }));
  res.send(html(body, { values }));
});

server.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/'
  })
)

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  await StudentModel.create(s)
  res.redirect('/')
})

server.post('/deleteAll', async (req, res) => {
  await StudentModel.deleteMany({});
  res.redirect('/')
})

server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

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

  await StudentModel.create({
    userName: 'asd', password: 'asd', department: '', track: '', requirementVersion: '', gradSemester: '', coursePlan: '', graduated: false, comments: '', sbuId: 0,
  });
  await GPDModel.create({ userName: 'qwe', password: 'qwe' });


  server.listen(3000, () => console.log(`http://localhost:${port}/ !`));
})();
