// import * as pdf from 'pdfjs-dist'
import * as pdf from 'pdfjs-dist/es5/build/pdf';
import { performance } from 'perf_hooks';

import type { Course, Offering, ScrapedCourse } from '../../model/course';

type SC = Omit<ScrapedCourse, 'courseSet' | '__t'>;

interface Acc {
  title?: {
    department: string,
    number: string,
    fullName: string
  },
  desc: string[],
  acc: SC[]
}

const sp = (r: RegExp) => RegExp(r.source.replace(/ /g, '\\s*'), r.flags);
// Hoisted to give more room to read and debug
const re = sp(/(?:(?:(\d+)-)?(\d+) credits?, )?((?:Letter graded \(A, A-, B\+, etc\.\))|(?:S\/U grading))?( (?:May be repeated for credit|May be repeated (\d+) times? FOR credit)\.?)?$/i);
const prRe = /.*Prerequisite.*:(.*)/i;
const offeredAsRe = /Offered\s+As(.*)/i;
const courseRe = /([a-z]{3})(\/[a-z]{3})?\s*(\d{3})/ig;

function parseDesc(desc: string) {
  const m = desc.match(re);
  if (m == null) {
    return null;
  }
  const [_, minS, maxS, _grading, rep, repCount] = m;
  const prerequisites: Course[] = [];
  let inbetween = desc.slice(0, m.index);
  let offeredAsStr = inbetween;
  const pr = inbetween.match(prRe);
  if (pr != null) {
    const [_, pq] = pr;
    if (pq) {
      inbetween = pq;
      offeredAsStr = inbetween.slice(0, pr.index);
      for (const p of pq.matchAll(courseRe)) {
        const [_, d0, d1, number] = p;
        prerequisites.push({ department: d0!, number: +number! });
        if (d1 != null) {
          prerequisites.push({ department: d1, number: +number! });
        }
      }
    }
  }

  const semester: string[] = [];
  for (const sem of ['Fall', 'Spring', 'Summer']) {
    if (inbetween.includes(sem)) {
      semester.push(sem);
    }
  }

  let yearParity;
  if (inbetween.includes('even years')) {
    yearParity = 0;
  } else if (inbetween.includes('odd years')) {
    yearParity = 1;
  }

  let repeat = 0;
  if (rep) {
    repeat = +(repCount ?? Number.POSITIVE_INFINITY);
  }

  const offeredAs: Course[] = [];
  const oa = offeredAsStr.match(offeredAsRe);
  if (oa != null) {
    const [_, oa0] = oa;
    if (oa0) {
      for (const p of oa0.matchAll(courseRe)) {
        const [_, d0, d1, number] = p;
        offeredAs.push({ department: d0!, number: +number! });
        if (d1 != null) {
          offeredAs.push({ department: d1, number: +number! });
        }
      }
    }
  }

  return {
    minCredits: +(minS ?? maxS ?? 3) | 0,
    maxCredits: +(maxS ?? 3) | 0,
    offering: {
      semester,
      yearParity,
    },
    repeat,
    prerequisites,
    offeredAs,
  };
}

const creditsRe = /(?:(\d+)-)?(\d+) credits?/i;
function parseDesc1(desc: string): {
  minCredits: number, maxCredits: number,
  offering: Offering, prerequisites: Course[],
  offeredAs: Course[]
} {
  const p = parseDesc(desc);
  if (p != null) {
    return p;
  }
  const m = desc.match(creditsRe);
  if (!m) {
    return {
      minCredits: 3,
      maxCredits: 3,
      offering: {
        semester: [],
      },
      prerequisites: [],
      offeredAs: [],
    };
  }
  const [_, minS, maxS] = m;
  return {
    minCredits: +(minS ?? maxS ?? 3) | 0,
    maxCredits: +(maxS ?? 3) | 0,
    offering: {
      semester: [],
    },
    prerequisites: [],
    offeredAs: [],
  };
}

// https://stackoverflow.com/a/42755876
class ExtendedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class RethrownError extends ExtendedError {
  original: Error

  newStack: Error['stack']

  constructor(message, error) {
    super(message);
    if (!error) throw new Error('RethrownError requires a message and error');
    this.original = error;
    this.newStack = this.stack;
    const messageLines = (this.message.match(/\n/g) || []).length + 1;
    if (this.stack !== undefined) {
      this.stack = `${this.stack.split('\n').slice(0, messageLines + 1).join('\n')}\n${error.stack}`;
    }
  }
}

const titleRe = /^\s*(\S+)\s+(\d+)\s*:\s*(.*)$/;
export async function parsePdf(fileName: string): Promise<Omit<ScrapedCourse, 'courseSet' | '__t' | 'prerequisites'>[]> {
  const start = performance.now();
  const loadingTask = pdf.getDocument(fileName);
  let doc;
  try {
    doc = await loadingTask.promise;
  } catch (e) { throw new RethrownError('Unable to parse PDF', e); }
  const { numPages } = doc;

  const loadPage = async (pageNum: number) => {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    // Spring # optional
    // 2020   # optional
    // GRADUATE  COURSE  DESCRIPTIONS
    // Spring 2020
    // ...
    // Stony Brook University Graduate Bulletin: www.stonybrook.edu/gradbulletin
    // ${pageNum}

    const gcd = 'GRADUATE  COURSE  DESCRIPTIONS';
    const bu = 'Stony Brook University Graduate Bulletin: www.stonybrook.edu/gradbulletin';
    const i = content.items.findIndex((x) => x.str === gcd);
    const j = content.items.findIndex((x) => x.str === bu);
    return content.items.slice(i + 1, j).map((x) => x.str);
  };

  const push = (acc: Acc) => {
    const { title, desc } = acc;
    if (title == null) {
      return;
    }
    const { department, number, fullName } = title;
    const pd = parseDesc1(desc.join(' '));
    if (pd == null) {
      throw Error('Unable to parse course description');
    }
    const sc = {
      department,
      number: +number | 0,
      fullName,
      ...pd,
    };
    acc.acc.push(sc);
    acc.title = undefined;
    acc.desc = [];
  };

  // TODO not using fonts has issues with multiline titles eg AMS 500
  const processPage = (acc: Acc, ps: string[]) => {
    for (const line of ps) {
      const m = line.match(titleRe);
      if (m !== null) {
        push(acc);
        const [_, department, number, fullName] = m;
        acc.title = { department: department!, number: number!, fullName: fullName! };
      } else {
        acc.desc.push(line);
      }
    }
  };

  const acc: Acc = {
    title: undefined,
    desc: [],
    acc: [],
  };
  if (process.env.NODE_ENV === 'development') {
    console.log('Starting scraping');
  }
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    // eslint-disable-next-line no-await-in-loop
    const ps = await loadPage(pageNum);
    processPage(acc, ps);
  }
  push(acc);

  if (process.env.NODE_ENV === 'development') {
    console.log(`Parsed PDF in: ${(performance.now() - start) / 1000} s`);
  }
  return acc.acc;
}
