import { test } from 'node:test';
import { Application } from 'typedoc';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path/posix';
import { getTypeDocConfig } from '../../scripts/markdown/api/utils.mjs';

const fixturesDir = './tests/theme/fixtures';
const outputDir = './tests/theme/.temp';

test('TypeDoc Theme - Edge Cases Fixture', async t => {
  const inputFilePath = join(fixturesDir, 'input.js');

  const app = await Application.bootstrapWithPlugins({
    ...getTypeDocConfig(),
    entryPoints: [inputFilePath],
    out: outputDir,
    publicPath: '/',
    tsconfig: join(fixturesDir, 'tsconfig.json'),
  });

  const project = await app.convert();
  await app.generateOutputs(project);

  const mdFiles = readdirSync(outputDir, { recursive: true }).filter(
    f => f.endsWith('.md') && !f.endsWith('index.md')
  );

  if (mdFiles.length === 0) throw new Error('No markdown file generated');

  mdFiles.sort();

  const actualMarkdown = mdFiles
    .map(f => readFileSync(join(outputDir, f), 'utf-8'))
    .join('\n\n---\n\n');

  rmSync(outputDir, { recursive: true, force: true });

  t.assert.snapshot(actualMarkdown);
});
