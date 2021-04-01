/* eslint-disable no-console */

import express from 'express';
import { renderToString } from 'react-dom/server';
import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import https from 'https';
import fs from 'fs';
import { IncomingForm } from 'formidable';

import {
  StudentModel, GPDModel, getQS, copyStudentWithPermissions,
} from './models';
import { ServerApp } from '../common/app';
import { Student } from '../common/model';
import { auth } from './auth';
import Login from '../common/login';
import { parsePdf } from './import';

const html = (body: string, val?: any, url = 'client') => {
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
    <link
      rel="stylesheet"
      href="/public/style.css"
      crossorigin="anonymous"
    />
${v}
    <script src="/public/${url}.js" defer></script>
    </head>
    <body style="margin:0;">
      <div id="app">${body}</div>
    </body>
  </html>
`;
};

const port = {
  http: 3000,
  https: 3001,
};

const server = express();
server.use(express.urlencoded({ extended: true }));
server.use(express.text());
server.use('/public', express.static('build/public'), express.static('public'));

server.set('query parser', 'simple');
server.use(express.json()); // support json encoded bodies

server.use(auth);

server.get('/login', (req, res) => {
  const flash = req.flash('error');
  const body = renderToString(Login({ flash }));
  res.send(
    html(
      body, { flash }, 'login',
    ),
  );
});

server.use((req, res, next) => {
  if (req.user == null) {
    res.redirect('/login');
  } else {
    next();
  }
});

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

server.get('/searchForStudent', async (req, res) => {
  // TODO sec forall tbh
  const s = await StudentModel.find(getQS(req.originalUrl, Student.fields));
  const values = s.map((x) => pickFromQ(x));
  // TODO qs state modal
  const body = renderToString(ServerApp(req.url, { values }));
  res.send(html(body, { values }));
});

server.get('/editStudentInformation/:username', async (req, res) => {
  const { username } = req.params;
  // TODO proper err
  const user_ = await StudentModel.findOne({ username });
  const user = pickFromQ(user_);
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
});

server.post('/editStudentInformation/:username', async (req, res) => {
  // TODO permissions
  try {
    await StudentModel.findOneAndUpdate(
      { username: req.params.username },
      copyStudentWithPermissions(req.body, req.user!),
    );
  } catch (e) { console.error(e); }
  res.redirect(303, req.originalUrl);
});

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  try {
    await StudentModel.create(s);
  } catch (e) { console.log(e); }
  res.redirect('/');
});

server.post('/deleteAll', async (req, res) => {
  await StudentModel.deleteMany({});
  res.redirect('/');
});

server.get('/student_Home', async (req, res) => {
  try {
    const user = await StudentModel.findOne({ username: req.user?.username });
    res.render('student', { users: user });
  } catch (e) { console.error(e); }
});

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  await StudentModel.create(s);
  res.redirect('/');
});

server.post('/import/scrape', (req, res, next) => {
  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    res.json(await parsePdf((files.upload as any).path));
  });
});

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
    useFindAndModify: false,
    useCreateIndex: true,
    dbName: 'cse416',
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
