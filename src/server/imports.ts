import Router from 'express';
import type Formidable from 'formidable';
import type { IncomingMessage } from 'http';
import { IncomingForm } from 'formidable';
import fs, { promises as fsp } from 'fs';
import parseCsv from 'csv-parse';
import type { CourseOffering } from '../model/course';
import { parsePdf } from './imports/parsePdf';
import {
  ScrapedCourseSetModel, ScrapedCourseModel, CourseOfferingModel,
  CoursePlanModel, DegreeRequirementsModel, StudentModel,
} from './models';

// TODO subtyping?
const me = function mapEntries<T, K extends string, V>(
  o: T, f: (arg: [keyof T, T[keyof T]]) => [K, V] | null | undefined,
): { [k in K]: V } {
  return Object.fromEntries(Object.entries(o)
    .map(f as any).filter(<U>(x: U): x is NonNullable<U> => x != null) as any) as any;
};

async function readCSV<T>(path: fs.PathLike | undefined): Promise<T[]> {
  if (path == null) { throw Error('path is undefined'); }
  const csv = fs.createReadStream(path)
    .pipe(parseCsv({ columns: true }));
  const acc: T[] = [];
  for await (const r of csv) {
    acc.push(r);
  }
  return acc;
}

async function parseForm(
  req: IncomingMessage, options?: Partial<Omit<Formidable.Options, 'multiples'>>,
): Promise<{ fields: Formidable.Fields, files: { [k: string]: Formidable.File } }>;
async function parseForm(
  req: IncomingMessage, options: Partial<Omit<Formidable.Options, 'multiples'> & { multiples: true }>,
): Promise<{ fields: Formidable.Fields, files: { [k: string]: Formidable.File[] } }>;
async function parseForm(
  req: IncomingMessage, options: Partial<Formidable.Options> | undefined,
) {
  const form = new IncomingForm(options);
  return new Promise((res, rej) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return rej(err);
      }
      return res({ fields, files });
    });
  });
}

const router = Router();

router.post('/scrape', async (req, res) => {
  const { fields, files } = await parseForm(req);
  // TODO parallelize
  const path = files.file?.path;
  if (path == null) { throw Error(); }
  const pdfCourses = await parsePdf(path);
  const { year, semester, department } = fields;
  const departments = (department as string).split(',').map((x) => x.trim());
  const courseSet = await ScrapedCourseSetModel.create({
    year, semester,
  });
  await ScrapedCourseModel.bulkWrite(
    pdfCourses.map((c) => {
      if (!departments.includes(c.department)) {
        return null;
      }
      const filter = me(c, ([k, v]) => [k, { $eq: v }]);
      return {
        updateOne: {
          filter,
          update: { $push: { courseSet: courseSet._id } },
          upsert: true,
        },
      };
    }).filter(<U>(x: U): x is NonNullable<U> => x != null),
  );
  return res.redirect('/');
});

router.post('/degreeRequirements', async (req, res) => {
  const { files } = await parseForm(req);
  const path = files.file?.path;
  if (path == null) { throw Error(); }
  const dr = JSON.parse(await fsp.readFile(path, { encoding: 'utf8' }));
  await DegreeRequirementsModel.create(dr);
  return res.redirect('/');
});

async function parseCourseOffering(path: fs.PathLike | undefined) {
  const acc: (Omit<CourseOffering, 'number'> & { 'course_num': any; })[] = await readCSV(path);
  await CourseOfferingModel.bulkWrite(
    acc.map((c) => {
      const filter = me(c,
        ([k, v]) => {
          if (!['year', 'semester'].includes(k)) {
            return null;
          }
          return [k, { $eq: v }];
        });
      return {
        deleteMany: {
          filter,
        },
      };
    }),
  );
  await CourseOfferingModel.bulkWrite(
    acc.map((c) => {
      const filter = me(c, ([k, v]) => [k === 'course_num' ? 'number' : k, { $eq: v }]);
      return {
        updateOne: {
          filter,
          update: { $setOnInsert: c },
          upsert: true,
        },
      };
    }),
  );
}

router.post('/courseOffering', async (req, res) => {
  const { files } = await parseForm(req);
  await parseCourseOffering(files.file?.path);
  return res.redirect('/');
});

const sc2cc = (s: string) => {
  const a = s.split('_');
  return a[0] + a.slice(1).map((x) => x[0]?.toUpperCase() + x.slice(1)).join('');
};
// TODO extract common functionality
router.post('/studentData', async (req, res) => {
  const { files } = await parseForm(req);
  const profile: any[] = await readCSV(files.profile?.path);
  await CoursePlanModel.bulkWrite(
    profile.map((c) => {
      const filter = { sbuId: { $eq: c.sbu_id } };
      return {
        deleteMany: {
          filter,
        },
      };
    }),
  );
  await StudentModel.bulkWrite(
    profile.map((c) => {
      const filter = { sbuId: { $eq: c.sbu_id } };
      return {
        deleteMany: {
          filter,
        },
      };
    }),
  );
  await StudentModel.bulkWrite(
    profile.map((c) => {
      const filter = { email: { $eq: c.email } };
      return {
        deleteMany: {
          filter,
        },
      };
    }),
  );
  await StudentModel.create(
    profile.map((c) => me(c, ([k, v]) => [sc2cc(k as string), v])),
  );
  // TODO parallelize
  const plan: any[] = await readCSV(files.plan?.path);
  await CoursePlanModel.bulkWrite(
    plan.map((c) => {
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
  return res.redirect('/');
});

router.post('/grades', async (req, res) => {
  const { files } = await parseForm(req);
  const acc: any[] = await readCSV(files.file?.path);
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
  return res.redirect('/');
});

export { router as imports };
