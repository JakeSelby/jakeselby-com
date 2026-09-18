import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const config = {
  SITE_AWS_ACCOUNT_ID: '123456789012',
  SITE_HOSTED_ZONE_ID: 'Z123EXAMPLE',
  SITE_BUCKET_NAME: 'example-personal-site',
  SITE_ROUTING_FUNCTION_NAME: 'example-site-routing',
};

function deploy(overrides = {}, fileConfig = false) {
  const root = mkdtempSync(join(tmpdir(), 'site-deploy-test-'));
  try {
    for (const dir of ['scripts', 'infra', 'bin']) mkdirSync(join(root, dir));
    copyFileSync(new URL('./deploy.sh', import.meta.url), join(root, 'scripts/deploy.sh'));
    const mocks = {
      git: 'if [ "$1" = status ]; then printf "%s" "$MOCK_DIRTY"; else echo "${MOCK_BRANCH:-main}"; fi',
      npm: 'mkdir -p dist/projects dist/resume dist/_astro; for file in dist/index.html dist/projects/index.html dist/resume/index.html; do echo "googletagmanager.com/gtag/js" > "$file"; done',
      npx: 'exit "${MOCK_CDK_EXIT:-0}"',
      aws: `case "$1 $2" in
  'sts get-caller-identity') echo "\${MOCK_ACCOUNT:-123456789012}" ;;
  'cloudformation describe-stacks')
    if [ "\${MOCK_OUTPUT_EXIT:-0}" != 0 ]; then exit "$MOCK_OUTPUT_EXIT"; fi
    case "$*" in *BucketName*) echo "\${MOCK_BUCKET:-example-personal-site}" ;; *) echo "\${MOCK_DIST:-E123EXAMPLE}" ;; esac ;;
esac`,
    };
    for (const [name, body] of Object.entries(mocks)) {
      writeFileSync(join(root, 'bin', name), `#!/bin/sh\necho '${name}' "+$*" >> "$MOCK_LOG"\n${body}\n`, { mode: 0o700 });
    }
    const env = {
      PATH: `${join(root, 'bin')}:/usr/bin:/bin`,
      HOME: root,
      MOCK_LOG: join(root, 'calls.log'),
      ...(fileConfig ? {} : config),
      ...overrides,
    };
    if (fileConfig) writeFileSync(join(root, '.env.infra'), Object.entries(config).map(([k, v]) => `${k}=${v}`).join('\n'));
    writeFileSync(env.MOCK_LOG, '');
    const result = spawnSync('/bin/bash', [join(root, 'scripts/deploy.sh')], { env, encoding: 'utf8' });
    return { ...result, calls: readFileSync(env.MOCK_LOG, 'utf8') };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('loads ignored deployment configuration and uses the deployed outputs', () => {
  const result = deploy({}, true);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.calls, /s3 sync dist\/ s3:\/\/example-personal-site/);
  assert.match(result.calls, /create-invalidation --distribution-id E123EXAMPLE/);
  assert.doesNotMatch(result.calls, /cdk output|list-distributions/);
});

test('missing configuration stops before any external command', () => {
  for (const key of Object.keys(config)) {
    const result = deploy({ [key]: '' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(key));
    assert.equal(result.calls, '');
  }
});

test('wrong credentials stop before building or deploying', () => {
  const result = deploy({ MOCK_ACCOUNT: '999999999999' });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.calls, /npm|npx|s3 sync/);
});

test('dirty trees and feature branches still stop deployment', () => {
  for (const options of [{ MOCK_DIRTY: ' M README.md' }, { MOCK_BRANCH: 'feature' }]) {
    const result = deploy(options);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.calls, /aws|npm|npx/);
  }
});

test('failed deployment or missing, mismatched, or unreadable outputs never sync', () => {
  for (const options of [
    { MOCK_CDK_EXIT: '1' },
    { MOCK_BUCKET: 'different-site' },
    { MOCK_DIST: 'None' },
    { MOCK_OUTPUT_EXIT: '1' },
  ]) {
    const result = deploy(options);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.calls, /s3 sync|create-invalidation/);
  }
});
