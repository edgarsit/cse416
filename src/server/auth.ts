import Router from 'express';
import { Types } from 'mongoose';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import flash from 'connect-flash';
import * as argon2 from 'argon2';

import { UserModel } from './models';
import { User as mUser } from '../common/model';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
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
router.use(passport.initialize());
router.use(passport.session());

const authOptions = { failureRedirect: '/login', failureFlash: true, successRedirect: '/' };

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await UserModel.findOne({ username });
      if (user != null && await argon2.verify(user.password, password)) {
        return done(null, user);
      }
      return done(null, false, { message: 'Incorrect credentials' });
    } catch (err) {
      return done(err);
    }
  },
));

router.post('/login', passport.authenticate('local', authOptions));

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
        message: 'The Google Account used is not associated with a MAST Account',
      });
    }
    return done(null, user);
  });
}));

router.get('/auth/google/callback', passport.authenticate('google', authOptions));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email'], failureFlash: true }));

passport.serializeUser<Types.ObjectId>((user, done) => {
  done(null, user._id);
});

passport.deserializeUser<Types.ObjectId>((id, done) => {
  UserModel.findById(id, done);
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
