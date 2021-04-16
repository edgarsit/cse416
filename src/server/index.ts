import express from 'express';
import { renderToString } from 'react-dom/server';
import mongoose from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import https from 'https';
import fs, { promises as fsp } from 'fs';
import Formidable, { IncomingForm } from 'formidable';
import argon2 from 'argon2';
import parseCsv from 'csv-parse';

import {
  UserModel,
  StudentModel, GPDModel, getQS, copyStudentWithPermissions,
  ScrapedCourseSetModel, ScrapedCourseModel, CourseOfferingModel, CoursePlanModel,
} from './models';
import { ServerApp } from '../common/app';
import { auth } from './auth';
import Login from '../common/login';
import { parsePdf } from './import';
import { Semester } from '../model/course';
import { Student } from '../model/user';

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
      return next(err);
    }
    try {
      // TODO parallelize
      const pdfCourses = await parsePdf((files.file as Formidable.File).path);
      const { year, semester, department } = fields;
      const departments = (department as string).split(',').map((x) => x.trim());
      const courseSet = await ScrapedCourseSetModel.create({
        year, semester: Semester[semester as any],
      });
      await ScrapedCourseModel.bulkWrite(
        pdfCourses.map((c) => {
          if (!departments.includes(c.department)) {
            return null;
          }
          const filter = Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { $eq: v }]));
          return {
            updateOne: {
              filter,
              update: { $push: { courseSet: courseSet._id } },
              upsert: true,
            },
          };
        }).filter(<U>(x: U): x is NonNullable<U> => x != null),
      );
    } catch (e) { return next(e); }
    return res.redirect('/');
  });
});

server.post('/import/degreeRequirements', (req, res, next) => {
  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }
    try {
      const test = JSON.parse(await fsp.readFile((files.file as Formidable.File).path, { encoding: 'utf8' }));
      console.log(test);
    } catch (err) { return next(err); }
    return res.redirect('/');
  });
});

server.post('/import/courseOffering', (req, res, next) => {
  const form = new IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }
    try {
      const csv = fs.createReadStream((files.file as Formidable.File).path)
        .pipe(parseCsv({ columns: true }));
      const acc: any[] = [];
      for await (const r of csv) {
        acc.push(r);
      }
      await CourseOfferingModel.bulkWrite(
        acc.map((c) => {
          const filter = Object.fromEntries(Object.entries(c)
            .map(([k, v]) => [k, { $eq: v }] as const)
            .filter(([k, _]) => ['year', 'semester'].includes(k)));
          return {
            deleteMany: {
              filter,
            },
          };
        }),
      );
      await CourseOfferingModel.bulkWrite(
        acc.map((c) => {
          const filter = Object.fromEntries(Object.entries(c).map(([k, v]) => [k === 'course_num' ? 'number' : k, { $eq: v }]));
          return {
            updateOne: {
              filter,
              update: { $setOnInsert: c },
              upsert: true,
            },
          };
        }),
      );
    } catch (e) { return next(e); }
    return res.redirect('/');
  });
});

const sc2cc = (s: string) => {
  const a = s.split('_');
  return a[0] + a.slice(1).map((x) => x[0]?.toUpperCase() + x.slice(1)).join('');
};
// TODO extract common functionality
server.post('/import/studentData', (req, res, next) => {
  const form = new IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }
    try {
      const csv = fs.createReadStream((files.profile as Formidable.File).path)
        .pipe(parseCsv({ columns: true }));
      const acc: any[] = [];
      for await (const r of csv) {
        acc.push(r);
      }
      await CoursePlanModel.bulkWrite(
        acc.map((c) => {
          const filter = { sbuId: { $eq: c.sbu_id } };
          return {
            deleteMany: {
              filter,
            },
          };
        }),
      );
      await StudentModel.bulkWrite(
        acc.map((c) => {
          const filter = { sbuId: { $eq: c.sbu_id } };
          const up = Object.fromEntries(Object.entries(c).map(([k, v]) => [sc2cc(k), v]));
          return {
            updateOne: {
              filter,
              update: { $setOnInsert: up },
              upsert: true,
            },
          };
        }),
      );
      // TODO parallelize
      const csv1 = fs.createReadStream((files.plan as Formidable.File).path)
        .pipe(parseCsv({ columns: true }));
      // TODO extract out loop
      const acc1: any[] = [];
      for await (const r of csv1) {
        acc1.push(r);
      }
      await CoursePlanModel.bulkWrite(
        acc1.map((c) => {
          const filter = Object.fromEntries(Object.entries(c).map(
            ([k, v]) => [sc2cc(k), { $eq: v }],
          ));
          return {
            updateOne: {
              filter,
              update: { $setOnInsert: c },
              upsert: true,
            },
          };
        }),
      );
    } catch (e) { return next(e); }
    return res.redirect('/');
  });
});

server.post('/import/grades', (req, res, next) => {
  const form = new IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }
    try {
      const csv = fs.createReadStream((files.files as Formidable.File).path)
        .pipe(parseCsv({ columns: true }));
      const acc: any[] = [];
      for await (const r of csv) {
        acc.push(r);
      }
      await CoursePlanModel.bulkWrite(
        acc.map((c) => {
          const filter = Object.fromEntries(Object.entries(c).map(
            ([k, v]) => [sc2cc(k), { $eq: v }],
          ));
          return {
            updateOne: {
              filter,
              update: { $setOnInsert: c },
              upsert: true,
            },
          };
        }),
      );
    } catch (e) { return next(e); }
    return res.redirect('/');
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

    await UserModel.findOneAndUpdate({ username: 'asd@stonybrook.edu' }, { password: await argon2.hash('') }, { upsert: true });

    await GPDModel.findOneAndUpdate({ username: 'ayoub.benchaita@stonybrook.edu' }, { password: await argon2.hash('') }, { upsert: true });
    await GPDModel.findOneAndUpdate({ username: 'edgar.sit@stonybrook.edu' }, { password: await argon2.hash('') }, { upsert: true });
    await GPDModel.findOneAndUpdate({ username: 'menachem.goldring@stonybrook.edu' }, { password: await argon2.hash('') }, { upsert: true });
    await GPDModel.findOneAndUpdate({ username: 'qwe' }, { password: await argon2.hash('qwe') }, { upsert: true });
    await StudentModel.findOneAndUpdate({ username: 'scott' }, {
      password: await argon2.hash('asd'),
      department: 'CS',
      track: 'Thesis',
      requirementVersionSemester: '123',
      requirementVersionYear: '123',
      graduationSemester: 'Spring',
      graduationYear: '2020',
      coursePlan: '',
      graduated: false,
      comments: 'Hello',
      sbuId: 123,
    }, { upsert: true });
    await StudentModel.findOneAndUpdate({ username: 'skiena' }, {
      password: await argon2.hash('asd'),
      department: 'CS',
      track: 'Thesis',
      requirementVersionSemester: '123',
      requirementVersionYear: '123',
      graduationSemester: 'Spring',
      graduationYear: '2020',
      coursePlan: '',
      graduated: false,
      comments: 'Hello',
      sbuId: 123,
    }, { upsert: true });

    https.createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    }, server).listen(port.https, () => console.log(`https://localhost:${port.https}/ !`));
    server.listen(port.http, () => console.log(`http://localhost:${port.http}/ !`));
  })();
}
