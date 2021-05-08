import express from 'express';
import { renderToString } from 'react-dom/server';
import mongoose from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';
import https from 'https';
import fs from 'fs';
import argon2 from 'argon2';

import {
  copyStudentWithPermissions,
  CoursePlanModel,
  getQS, GPDModel,
  StudentModel,
} from './models';
import * as modelHack from './models';
import { ServerApp } from '../common/app';
import { auth } from './auth';
import Login from '../common/login';
import { Student } from '../model/user';
import {
  imports, scrape, degreeRequirements, parseCourseOffering, studentData,
} from './imports';
import EditCoursePlan from '../common/editCoursePlan';
import { requirementStatus } from '../common/checkingRequirements';

const html = (body: string, val?: any, url = 'client') => {
  const v = val != null ? `    <script>window._v = ${JSON.stringify(val)}</script>` : '';
  return `
  <!DOCTYPE html>
  <html>
    <head>
    <link
      rel="stylesheet"
      href="/public/bootstrap.min.css"
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

// hack for video
server.get('/dump/:model', async (req, res) => {
  // eslint-disable-next-line import/namespace
  res.status(200).json(await modelHack[req.params.model!].find({}));
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
  for (const s of await StudentModel.find({})) {
    // eslint-disable-next-line no-await-in-loop
    const [satisfied, pending, unsatisfied] = await requirementStatus(s);
    s.satisfied = satisfied;
    s.pending = pending;
    s.unsatisfied = unsatisfied;
    s.save();
  }
  const s = await StudentModel.find(getQS(req.originalUrl, Student.fields));
  const values = s.map((x) => pickFromQ(x));
  // TODO qs state modal
  const body = renderToString(ServerApp(req.url, { values }));
  res.send(html(body, { values }));
});

server.get('/editStudentInformation/:email', async (req, res) => {
  const { email } = req.params;
  // TODO proper err
  const user_ = await StudentModel.findOne({ email });
  if (user_ != null) {
    const [satisfied, pending, unsatisfied] = await requirementStatus(user_);
    user_.satisfied = satisfied;
    user_.pending = pending;
    user_.unsatisfied = unsatisfied;
    user_.save();
  }
  const user = pickFromQ(user_);
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
});

server.get('/editStudentInfo/:email', async (req, res) => {
  const { email } = req.params;
  // TODO proper err
  const user_ = await StudentModel.findOne({ email });
  const user = pickFromQ(user_);
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
});

server.post('/editStudentInfor/:email', async (req, res) => {
  // TODO permissions
  try {
    await StudentModel.findOneAndUpdate(
      { email: req.params.email },
      copyStudentWithPermissions(req.body, req.user!),
    );
  } catch (e) { console.error(e); }
  res.redirect(303, req.originalUrl);
});

server.get('/editCoursePlan/get/:sbuId', async (req, res) => {
  const { sbuId } = req.params;
  const sbuId_ = sbuId ? +sbuId : undefined;
  const courses = await CoursePlanModel.find({ sbuId: sbuId_ }).sort({ year: 1, semester: 1 });
  const body = renderToString(EditCoursePlan({ sbuId: sbuId!, courses }));
  res.send(html(body, { sbuId: sbuId!, courses }, 'editCoursePlan'));
});

server.post('/editCoursePlan/delete/:sbuId/:id', async (req, res) => {
  const { id, sbuId } = req.params;
  await CoursePlanModel.findByIdAndRemove(id);
  res.redirect(`/editCoursePlan/get/${sbuId}`);
});

server.post('/editCoursePlan/set/:sbuId/:id', async (req, res) => {
  const { id, sbuId } = req.params;
  const grade = req.body[id!];
  const o = await CoursePlanModel.findById(id);
  if (o) {
    o.grade = grade;
    o.save();
  }
  res.redirect(`/editCoursePlan/get/${sbuId}`);
});

server.post('/editCoursePlan/add/:sbuId', async (req, res) => {
  const { sbuId } = req.params;
  await CoursePlanModel.create(req.body);
  res.redirect(`/editCoursePlan/get/${sbuId}`);
});

server.get('/Student_Home/:email', async (req, res) => {
  const { email } = req.params;
  // TODO proper err
  const user_ = await StudentModel.findOne({ email });
  const user = pickFromQ(user_);
  const body = renderToString(ServerApp(req.url, { user }));
  res.send(html(body, { user }));
});

server.post('/editStudentInformation/:email', async (req, res) => {
  // TODO permissions
  try {
    await StudentModel.findOneAndUpdate(
      { email: req.params.email },
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

server.post('/addStudent', async (req, res) => {
  const s = req.body;
  await StudentModel.create(s);
  res.redirect('/');
});

server.use('/import', imports);

server.get('*', (req, res) => {
  const body = renderToString(ServerApp(req.url, {}));
  res.send(
    html(
      body,
    ),
  );
});

if (process.argv[2] === '--load') {
  (async () => {
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      dbName: 'cse416',
    });
    mongoose.connection.db.dropDatabase();

    await scrape('data/courses/grad-courses-spring-2021.pdf', { year: '2021', semester: 'Spring', department: 'AMS, BMI, CSE, ESE, CHE, FIN, MCB' });

    await degreeRequirements('data/AMS Degree Requirements1.json');
    await degreeRequirements('data/BMI Degree Requirements1.json');
    await degreeRequirements('data/CSE Degree Requirements1.json');
    await degreeRequirements('data/ECE Degree Requirements1.json');

    await parseCourseOffering('data/course-offerings-AMS.csv');
    await parseCourseOffering('data/course-offerings-BMI.csv');
    await parseCourseOffering('data/course-offerings-CSE.csv');
    await parseCourseOffering('data/course-offerings-ESE.csv');

    await studentData('data/student-profiles.csv', 'data/course-plans.csv');
  })();
}

// TODO actual testing
if (process.argv[2] !== '--test') {
  (async () => {
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      dbName: 'cse416',
    });

    // TODO empty password crashes
    await GPDModel.findOneAndUpdate({ email: 'ayoub.benchaita@stonybrook.edu' }, { password: '' }, { upsert: true });
    await GPDModel.findOneAndUpdate({ email: 'edgar.sit@stonybrook.edu' }, { password: '' }, { upsert: true });
    await GPDModel.findOneAndUpdate({ email: 'menachem.goldring@stonybrook.edu' }, { password: '' }, { upsert: true });
    await GPDModel.findOneAndUpdate({ email: 'qwe' }, { password: await argon2.hash('qwe') }, { upsert: true });

    https.createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    }, server).listen(port.https, () => console.log(`https://localhost:${port.https}/ !`));
    server.listen(port.http, () => console.log(`http://localhost:${port.http}/ !`));
  })();
}
