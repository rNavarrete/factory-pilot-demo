import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyDiff } from './control-change.mjs';

function assertFlagged(files, pattern) {
  const result = classifyDiff(files);
  assert.equal(result.flagged, true, `expected flagged for ${JSON.stringify(files)}`);
  assert.ok(Array.isArray(result.reasons) && result.reasons.length > 0, 'expected reasons');
  if (pattern) {
    assert.ok(
      result.reasons.some((r) => pattern.test(r)),
      `expected a reason matching ${pattern}, got ${JSON.stringify(result.reasons)}`,
    );
  }
}

function assertNotFlagged(files) {
  const result = classifyDiff(files);
  assert.equal(result.flagged, false, JSON.stringify(result.reasons));
}

test('empty diff is not flagged', () => {
  assertNotFlagged([]);
});

test('plain src change is not flagged', () => {
  assertNotFlagged([
    { path: 'src/books.ts', status: 'modified', patch: '@@\n-const a = 1;\n+const a = 2;\n' },
    { path: 'src/new.ts', status: 'added', patch: '@@\n+export const x = 1;\n' },
    { path: 'src/style.css', status: 'modified', patch: '@@\n-a{}\n+b{}\n' },
  ]);
});

test('workflow edit is flagged', () => {
  assertFlagged(
    [{ path: '.github/workflows/ci.yml', status: 'modified', patch: '@@\n-a\n+b\n' }],
    /\.github/,
  );
});

test('release workflow edit is flagged too', () => {
  assertFlagged([{ path: '.github/workflows/release.yml', status: 'modified' }]);
});

test('CODEOWNERS edits are flagged', () => {
  assertFlagged([{ path: '.github/CODEOWNERS', status: 'modified' }]);
  assertFlagged([{ path: 'CODEOWNERS', status: 'added' }]);
});

test('script edit is flagged', () => {
  assertFlagged([{ path: 'scripts/check.mjs', status: 'modified' }], /scripts/);
  assertFlagged([{ path: 'scripts/lib/evidence.mjs', status: 'removed' }]);
});

for (const path of [
  'package.json',
  'package-lock.json',
  'eslint.config.js',
  '.prettierrc.json',
  '.prettierignore',
  'tsconfig.json',
  'vite.config.ts',
  '.nvmrc',
]) {
  test(`config file ${path} is flagged`, () => {
    assertFlagged([{ path, status: 'modified' }]);
  });
}

test('protected match is exact, not a substring', () => {
  assertNotFlagged([
    { path: 'src/package.json.ts', status: 'added', patch: '@@\n+export {};\n' },
    { path: 'src/scripts/helper.ts', status: 'added', patch: '@@\n+export {};\n' },
  ]);
});

test('renamed protected file is flagged', () => {
  assertFlagged([{ path: 'scripts/check.mjs', status: 'renamed' }]);
});

test('deleted test file is flagged', () => {
  assertFlagged([{ path: 'tests/books.test.ts', status: 'removed' }], /test/i);
});

test('removed assertion in a test file is flagged', () => {
  assertFlagged([
    {
      path: 'tests/books.test.ts',
      status: 'modified',
      patch: "@@ -1,3 +1,2 @@\n   it('x', () => {\n-    expect(a).toBe(1);\n     expect(b).toBe(2);\n",
    },
  ]);
});

test('removed it() in a test file is flagged', () => {
  assertFlagged([
    {
      path: 'tests/books.test.ts',
      status: 'modified',
      patch: "@@\n-  it('drops', () => {\n-    foo();\n-  });\n",
    },
  ]);
});

test('test files outside tests/ are covered too', () => {
  assertFlagged([{ path: 'src/books.test.ts', status: 'removed' }]);
});

for (const added of [
  "it.skip('x', () => {});",
  "describe.only('x', () => {});",
  "it.todo('x');",
  "it.fails('x', () => {});",
  "test.skip('x', () => {});",
]) {
  test(`adding ${added.split('(')[0]} in a test file is flagged`, () => {
    assertFlagged([{ path: 'tests/books.test.ts', status: 'modified', patch: `@@\n+  ${added}\n` }]);
  });
}

test('adding a new assertion to a test file is not flagged', () => {
  assertNotFlagged([
    {
      path: 'tests/books.test.ts',
      status: 'modified',
      patch: "@@\n   it('x', () => {\n+    expect(c).toBe(3);\n   });\n",
    },
  ]);
});

test('rewriting an assertion one-for-one is not flagged', () => {
  assertNotFlagged([
    {
      path: 'tests/books.test.ts',
      status: 'modified',
      patch: '@@\n-    expect(a).toBe(1);\n+    expect(a).toEqual(1);\n',
    },
  ]);
});

test('adding a new test file is not flagged', () => {
  assertNotFlagged([
    {
      path: 'tests/new.test.ts',
      status: 'added',
      patch: "@@\n+it('works', () => {\n+  expect(1).toBe(1);\n+});\n",
    },
  ]);
});

test('one protected file among many flags the whole diff', () => {
  assertFlagged([
    { path: 'src/books.ts', status: 'modified', patch: '@@\n+x\n' },
    { path: 'vite.config.ts', status: 'modified', patch: '@@\n+x\n' },
  ]);
});
