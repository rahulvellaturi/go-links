import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

describe.skip('server db (requires tsx child process; skipped in CI)', () => {
  const tmpDir = os.tmpdir();
  let dbPath: string;
  let scriptPath: string;

  beforeEach(() => {
    dbPath = path.join(tmpDir, `go-links-test-${Date.now()}.db`);
    // create a small runner script that imports a module path passed as arg
    scriptPath = path.join(tmpDir, `db-runner-${Date.now()}.ts`);
    fs.writeFileSync(
      scriptPath,
      `const target = process.argv[2];\nimport(target).then(({ createLink, incrementVisits, getAllLinks }) => {\n  const a = createLink('test1', 'https://example.test');\n  const all = getAllLinks();\n  const updated = incrementVisits('test1');\n  console.log(JSON.stringify({ created: a, allCount: all.length, updated }));\n}).catch(err => { console.error(err); process.exit(2); });\n`,
    );
  });

  afterEach(() => {
    try { fs.unlinkSync(dbPath); } catch {}
    try { fs.unlinkSync(scriptPath); } catch {}
  });

  it('creates link and increments visits (external runner)', () => {
    const projectDbPath = path.resolve(__dirname, '../../server/src/db');
    const { pathToFileURL } = require('url');
    const moduleSpecifier = pathToFileURL(projectDbPath).toString();

    try {
      const bin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
      const code = `console.log('DB_PATH=' + (process.env.DB_PATH||'')); import('${moduleSpecifier}').then(({ createLink, getAllLinks, incrementVisits }) => { const a = createLink('test1', 'https://example.test'); const all = getAllLinks(); const updated = incrementVisits('test1'); console.log('RESULT:' + JSON.stringify({ created: a, allCount: all.length, updated })); }).catch(err=>{ console.error(err); process.exit(2); });`;

      const out = execFileSync(bin, ['-e', code], {
        env: { ...process.env, DB_PATH: dbPath },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const outStr = out.trim();
      // look for RESULT: prefix
      const idx = outStr.indexOf('RESULT:');
      expect(outStr).toContain('DB_PATH=');
      expect(idx).toBeGreaterThan(-1);
      const parsed = JSON.parse(outStr.slice(idx + 'RESULT:'.length));
      expect(parsed.created.visits).toBe(0);
      expect(parsed.allCount).toBeGreaterThanOrEqual(1);
      expect(parsed.updated.visits).toBe(1);
    } catch (err: any) {
      const stdout = err.stdout || '';
      const stderr = err.stderr || '';
      throw new Error(`External runner failed. stdout:\n${stdout}\nstderr:\n${stderr}`);
    }
  });
});
