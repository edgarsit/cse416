import Router from 'express';
import { Types } from 'mongoose';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserModel } from './models';
import session from 'express-session';
import flash from 'connect-flash';

import { User as mUser } from '../common/model'

declare global {
  namespace Express {
    interface User extends mUser { }
  }
}

const router = Router();

router.use(flash());
router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
router.use(passport.initialize())
router.use(passport.session())

const authOptions = { failureRedirect: '/login', failureFlash: true, successRedirect: '/' };

passport.use(new LocalStrategy(
  (username, password, done) => {
    UserModel.findOne({ username, password }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user || !password) {
        return done(null, false, { message: 'Try again incorrect credentials' });
      }
      return done(null, user);
    });
  }
));

router.post('/login',
  passport.authenticate('local', authOptions)
);

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
      return done(null, false, {
        message: 'The Google Account used is not associated with a MAST Account'
      });
    }
    return done(null, user);
  });
}));

router.get('/auth/google/callback',
  passport.authenticate('google', authOptions)
);

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email'], failureFlash: true })
);

passport.serializeUser<Types.ObjectId>((user, done) => {
  done(null, user._id);
});

passport.deserializeUser<Types.ObjectId>((id, done) => {
  UserModel.findById(id, done)
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/', (req, res) => {
  if (req.user == null) {
    res.redirect('/login');
  } else if (req.user.__t === 'Student') {
    res.redirect('/Student_Home');
  } else {
    res.redirect('/GPD_Home');
  }
});

export { router as auth };
