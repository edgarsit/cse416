import * as pdf from 'pdfjs-dist/es5/build/pdf';

import { performance } from 'perf_hooks';

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
  acc: {
    [k: string]: {
      title: string,
      desc: string,
    }[]
  }
}

export async function parsePdf(fileName: string) {
  const start = performance.now();
  const loadingTask = pdf.getDocument(fileName);
  const doc = await loadingTask.promise;
  console.log('1', performance.now() - start);
  const { numPages } = doc;
  console.log(`Number of Pages: ${numPages}`);

  const loadPage = async (pageNum: number) => {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const v = assertArrayEq([null, null, 'GRADUATE  COURSE  DESCRIPTIONS', null], content.items, ['Stony Brook University Graduate Bulletin: www.stonybrook.edu/gradbulletin', `${pageNum}`], (item: any) => item.str);
    return v;
  };

  const push = (acc: Acc) => {
    const { title, desc } = acc;
    acc.acc[acc.short]!.push({ title, desc });
    acc.title = '';
    acc.desc = '';
  };

  const processPage = (acc: Acc, ps) => {
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
              acc.title += p.str;
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
              acc.acc[acc.short] = [];
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
  console.log('2', performance.now() - start);

  const acc: Acc = {
    short: '',
    long: '',
    title: '',
    desc: '',
    acc: {},
  };
  for (const ps of arr) {
    processPage(acc, await ps);
  }
  push(acc);

  console.log(`Total Time: ${(performance.now() - start) / 1000} s`);
  return acc;
}
