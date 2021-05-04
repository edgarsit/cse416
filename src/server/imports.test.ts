import fs, { promises as fsp } from 'fs';
import path from 'path';

const dataDir = 'data/';
const files = fs.readdirSync(dataDir).filter((x) => x.endsWith('json'));
for (const f of files) {
  const filepath = path.resolve(dataDir, f);
  // TODO wtf
  it(`parse ${f}`, async () => {
    JSON.parse(await fsp.readFile(filepath, { encoding: 'utf8' }));
    // expect(dr).toMatchSnapshot();
  });
}
