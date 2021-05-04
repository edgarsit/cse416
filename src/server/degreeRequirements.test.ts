/**
 * @jest-environment node
 */

import { mongoose } from '@typegoose/typegoose';
import fs, { promises as fsp } from 'fs';
import path from 'path';
import { DegreeRequirementsModel } from './models';

const dataDir = 'data/';
const files = fs.readdirSync(dataDir).filter((x) => x.endsWith('json'));

const removeId = (o) => {
  const s = JSON.stringify(o, (k, v) => {
    if (k === '_id') {
      return undefined;
    }
    return v;
  });
  JSON.parse(s);
};

describe('insert', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      dbName: 'cse416',
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  for (const f of files) {
    const filepath = path.resolve(dataDir, f);
    // eslint-disable-next-line no-loop-func
    it(`degree-req-import ${f}`, async () => {
      const dr = JSON.parse(await fsp.readFile(filepath, { encoding: 'utf8' }));
      const m = await DegreeRequirementsModel.create(dr);
      const drm = await DegreeRequirementsModel.findById(m._id);
      expect(removeId(drm)).toMatchSnapshot();
      await DegreeRequirementsModel.findByIdAndRemove(m._id);
    });
  }
});
