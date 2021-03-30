/* eslint-disable no-console */

import express from 'express';
import { renderToString } from 'react-dom/server';
import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import passport from 'passport';
import flash from 'connect-flash';
import https from 'https';
import fs from 'fs';

import {
  StudentModel, UserModel, GPDModel, getQS, copyStudentWithPermissions,
} from './models';
import { ServerApp } from '../common/app';
import { Student, User as mUser } from '../common/model';

const html = (body: string, val?: any) => {
  const v = val != null ? `    <script>window._v = ${JSON.stringify(val)}</script>` : '';
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
    <script src='/public/client.js' defer></script>
    </head>
    <body style='margin:0'>
      <div id='app'>${body}</div>
    </body>
  </html>
`;
};

declare global {
  namespace Express {
    interface User extends mUser {}
  }
}

const port = {
  http: 3000,
  https: 3001,
};
const server = express();
server.use(express.urlencoded({ extended: true }));
server.use(express.text());
server.use(flash());
server.set('view engine', 'ejs');
server.use(express.static('build'));
server.use('/public', express.static('public'));

server.set('query parser', 'simple');
server.use(express.json()); // support json encoded bodies

server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());

passport.use(new LocalStrategy(
  ((username, password, done) => {
    UserModel.findOne({ username, password }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user || !password) {
        return done(null, false, { message: 'Try again incorrect credentials' });
      }
      return done(null, user);
    });
  }),
));

passport.use(new GoogleStrategy({
  clientID: '22365015952-9kp5umlqtu97p4q36cigscetnl7dn3be.apps.googleusercontent.com',
  clientSecret: 'xa-6Hj_veI1YnjYhuEIEkdAz',
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  UserModel.findOne({ username: profile.emails?.[0]?.value }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'The Google Account used is not associated with a MAST Account' });
    }
    return done(null, user);
  });
}));

server.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    if ((req.user as any).__t === 'Student') {
      res.redirect('/Student_Home');
    } else {
      res.redirect('/');
    }
  });

function loggedIn(req, res, next) {
  if (req.user == null) {
    res.redirect('/login');
  } else {
    next();
  }
}

const pickFromQ = <T>(s: DocumentType<T> | null) => {
  const r = {};
  if (s == null) { return r; }
  // TODO lean?
  for (const [k, v] of Object.entries(s.toJSON())) {
    if (!k.startsWith('_')) {
      r[k] = v;
    }
  }
  return r;
};

server.post('/auth', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    if ((req.user as any).__t === 'Student') {
      res.redirect('/Student_Home');
    } else {
      res.redirect('/GPD_Home');
    }
  });

server.get('/searchForStudent', loggedIn, async (req, res) => {
  // TODO sec forall tbh
  const s = await StudentModel.find(getQS(req.originalUrl, Student.fields));
  const values = s.map((x) => {
    const a = {};
    // TODO undoc maybe lean
    for (const [k, v] of Object.entries((x as any)._doc)) {
      if (!k.startsWith('_')) {
        a[k] = v;
      }
    }
    return a;
  });
  // TODO qs state modal
  const body = renderToString(ServerApp(req.url, { values }));
  res.send(html(body, { values }));
});

server.get('/editStudentInformation/:username', loggedIn, async (req, res) => {
  const { username } = req.params;
  // TODO proper err
  const user_ = await StudentModel.findOne({ username });
  const user = pickFromQ(user_);
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
});

server.post('/editStudentInformation/:username', async (req, res) => {
  try {
    await StudentModel.findOneAndUpdate(
      { username: req.params.username },
      copyStudentWithPermissions(req.body, req.user!),
    );
  } catch (e) { console.error(e); }
  res.redirect(303, req.originalUrl);
});

server.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/',
}));

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  try {
    await StudentModel.create(s);
  } catch (e) { console.log(e); }
  res.redirect('/');
});

server.get('/login', (req, res) => {
  res.render('login', { messages: req.flash('error') });
  res.end();
});

server.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

server.post('/deleteAll', loggedIn, async (req, res, next) => {
  await StudentModel.deleteMany({});
  res.redirect('/');
});

server.get('/student_Home', loggedIn, async (req, res) => {
  try {
    const user = await StudentModel.findOne({ username: (req.user as any).username });
    res.render('student', { users: user });
  } catch (e) { console.error(e); }
});

server.post('/addStudent', loggedIn, async (req, res) => {
  const s = req.body;
  await StudentModel.create(s);
  res.redirect('/');
});

server.get('/auth/google',
  passport.authenticate('google', { scope: ['email'], failureFlash: true }));

passport.serializeUser((user, done) => {
  done(null, user as any);
});

passport.deserializeUser((user, done) => {
  done(null, user as any);
});

server.get('*', loggedIn, (req, res) => {
  const body = renderToString(ServerApp(req.url, {}));
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
    useFindAndModify: false,
  });

  await GPDModel.findOneAndUpdate({ username: 'ayoub.benchaita@stonybrook.edu' }, { password: 'asd' }, { upsert: true });
  await GPDModel.findOneAndUpdate({ username: 'edgar.sit@stonybrook.edu' }, { password: 'asd' }, { upsert: true });
  await GPDModel.findOneAndUpdate({ username: 'qwe' }, { password: 'qwe' }, { upsert: true });
  await StudentModel.findOneAndUpdate({ username: 'scott' }, {
    password: 'asd', department: 'CS', track: 'Advanced Project Option', requirementVersion: '456', gradSemester: '2020', coursePlan: '', graduated: false, comments: 'Hi!', sbuId: 0,
  }, { upsert: true });
  await StudentModel.findOneAndUpdate({ username: 'skiena' }, {
    password: 'asd', department: 'CS', track: 'Thesis', requirementVersion: '123', gradSemester: '2040', coursePlan: '', graduated: false, comments: 'Hello', sbuId: 0,
  }, { upsert: true });

  https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  }, server).listen(port.https, () => console.log(`https://localhost:${port.https}/ !`));
  server.listen(port.http, () => console.log(`http://localhost:${port.http}/ !`));
})();
