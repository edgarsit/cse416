import fs, { promises as fsp } from 'fs';
import path from 'path';

const dataDir = 'data/';
const files = fs.readdirSync(dataDir).filter((x) => x.endsWith('json'));
for (const f of files) {
  const filepath = path.resolve(dataDir, f);
  // TODO wtf
  // eslint-disable-next-line no-loop-func
  it(`parse ${f}`, async () => {
    const dr = JSON.parse(await fsp.readFile(filepath, { encoding: 'utf8' }));
    expect(dr).toMatchSnapshot();
  });
}
