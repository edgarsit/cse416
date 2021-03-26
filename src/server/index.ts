import express from 'express';
import { renderToString } from 'react-dom/server';
import mongoose from 'mongoose';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { URL } from 'url';
import { DocumentType } from '@typegoose/typegoose';
import {
  StudentModel, UserModel, GPDModel,
} from './models';
import { ServerApp } from '../common/app';
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
    <script src='/public/client.js' defer></script>
    </head>
    <body style='margin:0'>
      <div id='app'>${body}</div>
    </body>
  </html>
`;
};

const port = 3000;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.text());

server.use(express.static('build'));
server.use('/public', express.static('public'));

server.set('query parser', 'simple');

server.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

server.use(passport.initialize());
server.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    UserModel.findOne({ userName: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      return done(null, user);
    });
  },
));

server.post('/auth', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
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
}));

passport.use(new LocalStrategy(
  (username, password, done) => {
    UserModel.findOne({ userName: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  },
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser<Express.User>((user, done) => {
  done(null, user);
});

server.get('/', (req, res) => {
  if (req.user) {
    if ((req.user as any).__t === 'GPD') {
      res.redirect('home');
    } else {
      res.redirect('home');
    }
  } else {
    res.redirect('/login');
  }
});

server.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

// TODO fix + use
function loggedIn(req, res, next) {
  if (req.user == undefined) {
    res.redirect('/login');
  } else {
    next();
  }
}

const getQS = (originalURL: string) => {
  const params = new URL(originalURL, 'http://localhost').searchParams;
  const r = {};
  // TODO hoist
  for (const k of Object.keys(cols)) {
    const v = params.get(k);
    // TODO Fix hack -> hasOwnProp
    if (v != null && v !== '' && v != 'Ignore') {
      r[k] = v;
    }
  }
  return r;
};

const pickFromQ = <T>(s: DocumentType<T> | null) => {
  const r = {}
  if (s == null) { return r }
  // TODO undoc, lean?
  for (const [k, v] of Object.entries((s as any)._doc)) {
    if (!k.startsWith('_')) {
      r[k] = v
    }
  }
  return r
}

server.get('/searchForStudent', async (req, res) => {
  // TODO sec forall tbh
  const s = await StudentModel.find(getQS(req.originalUrl));
  const values = s.map((x) => {
    const a = {}
    // TODO undoc maybe lean
    for (const [k, v] of Object.entries((x as any)._doc)) {
      if (!k.startsWith('_')) {
        a[k] = v
      }
    }
    return a
  })
  // TODO qs state modal
  const body = renderToString(ServerApp(req.url, { values }));
  res.send(html(body, { values }));
});

server.get('/editStudentInformation', async (req, res) => {
  const params = new URL(req.originalUrl, 'http://localhost').searchParams;
  // TODO wtf
  const userName = params.get('userName') as any;
  // TODO proper err
  const user = pickFromQ(await StudentModel.findOne({ userName }));
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
})

server.post('/editStudentInformation', async (req, res) => {
  try {
    await StudentModel.findOneAndUpdate(
      { userName: req.body.userName },
      // TODO wtf
      { ...req.body }
    )
  } catch (e) { console.error(e) }
  res.redirect(req.originalUrl)
})

server.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
  }));

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  await StudentModel.create(s);
  res.redirect('/');
});

server.post('/deleteAll', async (req, res) => {
  await StudentModel.deleteMany({});
  res.redirect('/');
});

server.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

server.get('*', (req, res) => {
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
  });
  mongoose.connection.db.dropDatabase();

  await StudentModel.create({
    userName: 'asd', password: 'asd', department: 'CS', track: '', requirementVersion: '1', gradSemester: '123', coursePlan: '', graduated: false, comments: '', sbuId: 0,
  });
  await GPDModel.create({ userName: 'qwe', password: 'qwe' });

  server.listen(3000, () => console.log(`http://localhost:${port}/ !`));
})();
