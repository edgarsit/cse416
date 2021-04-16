import * as pdf from 'pdfjs-dist/es5/build/pdf';
import { TextItem } from 'pdfjs-dist/types/display/api';

import { CourseBase, ScrapedCourse } from '../model/course';

function assertArrayEq<T, U>(head: T[], s: U[], tail: T[], map: (arg: U) => T): U[] {
  if (s.length < head.length + tail.length) {
    throw new Error('Internal Error');
  }
  for (let i = 0; i < head.length; i++) {
    const a = head[i];
    const b = map(s[i]!);
    if (a != null && a !== b) {
      console.error(`"${a}" !== "${b}"`);
    }
  }
  for (let i = 0; i < tail.length; i++) {
    const a = tail[i];
    const b = map(s[(s.length - tail.length) + i]!);
    if (a != null && a !== b) {
      console.error(`"${a}" !== "${b}"`);
    }
  }
  return s.slice(head.length, -tail.length);
}

interface Acc {
  short: string,
  long: string,
  title: string,
  desc: string,
  acc: Omit<ScrapedCourse, 'courseSet' | '__t' | 'prerequisites'>[],
}

// Hoisted to give more room to read and debug
const re = /(?:(?:(\d+)-)?(\d+) credits?, )?((?:Letter graded \(A, A-, B\+, etc\.\))|(?:S\/U grading))?( (?:May be repeated for credit|May be repeated \d+ times FOR credit)\.?)?$/i;
const re1 = /.*Prerequisite.*:(.*)/i;
const re2 = /([a-z]{3})(\/[a-z]{3})?\s*(\d{3})/ig;
function parse(desc: string): {
  minCredits: number, maxCredits: number, prerequisites: CourseBase[]
} | null {
  const m = desc.match(re);
  if (m == null) {
    return null;
  }
  const [_, minS, maxS] = m;
  // TODO remove cring
  const prerequisites: CourseBase[] = [];
  const n = desc.slice(0, m.index).match(re1);
  if (n != null) {
    const [_, pq] = n;
    if (pq) {
      for (const p of pq.matchAll(re2)) {
        const [_, d0, d1, number] = p;
        prerequisites.push({ department: d0!, number: +number! });
        if (d1 != null) {
          prerequisites.push({ department: d1, number: +number! });
        }
      }
    }
  }
  return {
    minCredits: +(minS ?? maxS ?? 3) | 0,
    maxCredits: +(maxS ?? 3) | 0,
    prerequisites,
  };
}

export async function parsePdf(fileName: string): Promise<Omit<ScrapedCourse, 'courseSet' | '__t' | 'prerequisites'>[]> {
  const loadingTask = pdf.getDocument(fileName);
  const doc = await loadingTask.promise;
  const { numPages } = doc;

  const loadPage = async (pageNum: number) => {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const v = assertArrayEq([null, null, 'GRADUATE  COURSE  DESCRIPTIONS', null], content.items, ['Stony Brook University Graduate Bulletin: www.stonybrook.edu/gradbulletin', `${pageNum}`], (item) => item.str);
    return v;
  };

  const push = (acc: Acc) => {
    const { title, desc } = acc;
    const m = title.match(/^\s*(\S+)\s+(\S*)\s*:\s*(.*)$/);
    if (m == null) {
      throw Error('Unable to split course title');
    }
    const [_, department, number, fullName] = m;
    const pd = parse(desc);
    if (pd == null) {
      throw Error('Unable to parse course description');
    }
    const sc = {
      department: department!,
      number: +number! | 0,
      fullName: fullName!,
      ...pd,
    };
    acc.acc.push(sc);
    acc.title = '';
    acc.desc = '';
  };

  // TODO fix run on parsing
  const processPage = (acc: Acc, ps: TextItem[]) => {
    for (const p of ps) {
      switch (p.fontName) {
        case 'Helvetica':
          switch (p.height) {
            case 11.25:
              if (acc.short === '' || acc.title !== '' || acc.desc !== '') {
                throw new Error();
              }
              acc.long += p.str;
              break;
            case 9:
              if (acc.short === '' || acc.long === '') {
                throw new Error();
              }
              if (acc.desc !== '') {
                push(acc);
              }
              acc.title = `${acc.title} ${p.str}`;
              break;
            default:
              throw new Error();
          }
          break;
        case 'Times':
          switch (p.height) {
            case 22.5:
              if (acc.title !== '') {
                push(acc);
              }
              acc.short = p.str;
              acc.long = '';
              break;
            case 9:
              if (acc.short === '' || acc.title === '') {
                throw new Error();
              }
              acc.desc = `${acc.desc} ${p.str}`;
              break;
            default:
              throw new Error();
          }
          break;
        default:
          throw new Error();
      }
    }
  };

  const arr = new Array(numPages).fill(undefined).map((_, i) => loadPage(i + 1));

  const acc: Acc = {
    short: '',
    long: '',
    title: '',
    desc: '',
    acc: [],
  };
  for (const ps of arr) {
    processPage(acc, await ps); // eslint-disable-line no-await-in-loop
  }
  push(acc);
  return acc.acc;
}
