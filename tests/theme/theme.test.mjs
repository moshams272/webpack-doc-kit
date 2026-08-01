import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Application } from 'typedoc';
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path/posix';

const fixturesDir = './tests/theme/fixtures';
const outputDir = './tests/theme/.temp';

const testCases = readdirSync(fixturesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

describe('TypeDoc Theme', () => {
  for (const testCase of testCases) {
    it(`should correctly render ${testCase}`, async () => {
      const caseDir = join(fixturesDir, testCase);
      const inputFilePath = join(caseDir, 'input.js');
      const expectedFilePath = join(caseDir, 'expected.md');

      const app = await Application.bootstrapWithPlugins({
        entryPoints: [inputFilePath],
        out: outputDir,
        plugin: [
          'typedoc-plugin-markdown',
          './plugins/processor/index.mjs',
          './plugins/theme/index.mjs',
        ],
        theme: 'doc-kit',
        router: 'doc-kit',
        hideGroupHeadings: true,
        hideBreadcrumbs: true,
        hidePageHeader: true,
        readme: 'none',
        disableSources: true,
        propertiesFormat: 'table',
        membersWithOwnFile: ['Class'],
        modulesFileName: 'index',
        entryFileName: 'index',
        tsconfig: join(fixturesDir, 'tsconfig.json'),
      });

      const project = await app.convert();
      await app.generateOutputs(project);

      // With membersWithOwnFile: ['Class'] and the doc-kit router,
      // Find the generated class markdown file dynamically
      const mdFiles = readdirSync(outputDir, { recursive: true }).filter(
        f => f.endsWith('.md') && !f.endsWith('index.md')
      );
      if (mdFiles.length === 0) throw new Error('No markdown file generated');
      const actualMarkdown = readFileSync(join(outputDir, mdFiles[0]), 'utf-8');

      // If UPDATE_SNAPSHOTS is set or expected.md does not exist, write the actual output to expected.md
      if (!existsSync(expectedFilePath)) {
        writeFileSync(expectedFilePath, actualMarkdown, 'utf-8');
      }

      const expectedMarkdown = readFileSync(expectedFilePath, 'utf-8');

      rmSync(outputDir, { recursive: true, force: true });

      assert.strictEqual(actualMarkdown, expectedMarkdown);
    });
  }
});
