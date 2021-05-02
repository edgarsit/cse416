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
const re2 = /([a-z]{3})(\/[a-z]{3})?\s*(\d{3})/ig;
function parseDesc(desc: string) {
  const m = desc.match(re);
  if (m == null) {
    return null;
  }
  const [_, minS, maxS, _grading, rep, repCount] = m;
  const prerequisites: Course[] = [];
  let inbetween = desc.slice(0, m.index);
  const pr = inbetween.match(prRe);
  if (pr != null) {
    const [_, pq] = pr;
    if (pq) {
      inbetween = pq;
      for (const p of pq.matchAll(re2)) {
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

  return {
    minCredits: +(minS ?? maxS ?? 3) | 0,
    maxCredits: +(maxS ?? 3) | 0,
    offering: {
      semester,
      yearParity,
    },
    repeat,
    prerequisites,
  };
}

const creditsRe = /(?:(\d+)-)?(\d+) credits?/i;
function parseDesc1(desc: string): {
  minCredits: number, maxCredits: number,
  offering: Offering, prerequisites: Course[]
} {
  const p = parseDesc(desc);
  if (p != null) {
    return p;
  }
  const base = {
    offering: {
      semester: [],
      yearParity: -1,
    },
    prerequisites: [],
  };
  const m = desc.match(creditsRe);
  if (!m) {
    return {
      minCredits: 3,
      maxCredits: 3,
      ...base,
    };
  }
  const [_, minS, maxS] = m;
  return {
    minCredits: +(minS ?? maxS ?? 3) | 0,
    maxCredits: +(maxS ?? 3) | 0,
    ...base,
  };
}

const titleRe = /^\s*(\S+)\s+(\d+)\s*:\s*(.*)$/;
export async function parsePdf(fileName: string): Promise<Omit<ScrapedCourse, 'courseSet' | '__t' | 'prerequisites'>[]> {
  const start = performance.now();
  const loadingTask = pdf.getDocument(fileName);
  const doc = await loadingTask.promise;
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
