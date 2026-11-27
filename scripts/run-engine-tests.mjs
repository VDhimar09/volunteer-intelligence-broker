/**
 * Terminal test runner for the matching engine.
 *
 * Usage:  npm run test:engine
 *
 * Uses esbuild (already a Vite dependency) to bundle the TypeScript engine,
 * then runs the scenario checks in Node. The scenarios live in
 * `src/engine/engineTests.ts`, shared with the Testing & validation section
 * of the app, so the terminal and the UI always check the same rules.
 */

import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outfile = join(await mkdtemp(join(tmpdir(), 'vib-tests-')), 'engine-tests.mjs');

try {
  await build({
    stdin: {
      contents: `import { runEngineTests } from './src/engine/engineTests';\nimport { runBaseline } from './src/engine/baseline';\nimport { CASE_A, CASE_B } from './src/data/volunteer';\nimport { OPPORTUNITIES } from './src/data/opportunities';\n\nconst results = runEngineTests();\nconst baselineA = runBaseline(CASE_A, OPPORTUNITIES).filter(b => b.included).length;\nconst baselineB = runBaseline(CASE_B, OPPORTUNITIES).filter(b => b.included).length;\nexport { results, baselineA, baselineB };\n`,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    logLevel: 'silent',
  });

  const output = await import(pathToFileURL(outfile).href);
  const { results, baselineA, baselineB } = output;
  let failed = 0;

  for (const r of results) {
    console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.id}. ${r.name}`);
    console.log(`      ${r.detail}`);
    if (!r.passed) failed++;
  }

  console.log(`\nBaseline keyword search finds ${baselineA} records for Case A and ${baselineB} for Case B (7 fictional records total).`);
  console.log(`${results.length - failed}/${results.length} engine scenario checks passed.`);
  process.exitCode = failed > 0 ? 1 : 0;
} finally {
  await rm(outfile ? outfile.split('/engine-tests.mjs')[0] : '', { recursive: true, force: true });
}
