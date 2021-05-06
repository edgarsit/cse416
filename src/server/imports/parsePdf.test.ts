/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';
import { parsePdf } from './parsePdf';

const coursePdfDir = 'data/courses/';
const departments = 'AMS, BMI, CSE, ESE, CHE, FIN, MCB'.split(/[ ,]/);
for (const a of fs.readdirSync(coursePdfDir)) {
  const filepath = path.resolve(coursePdfDir, a);
  // eslint-disable-next-line no-loop-func
  it(`parsePdf ${a}`, async () => {
    const json = (await parsePdf(filepath))
      .filter((x) => departments.includes(x.department));
    expect(json).toMatchSnapshot();
  }, 15000);
}
