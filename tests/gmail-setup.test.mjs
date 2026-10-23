import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const script = pathToFileURL(process.cwd() + '/scripts/configure-email-otp.mjs').href;
const secret = 'v1,whsec_' + Buffer.alloc(32, 1).toString('base64');
const environment = {
  ...process.env,
  SUPABASE_ACCESS_TOKEN: 'test-management-token',
  SEND_EMAIL_HOOK_SECRET: secret,
  GMAIL_USER: 'test@gmail.com',
  GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GOOGLE_REFRESH_TOKEN: 'test-refresh-token',
};
function run(mode, mock, overrides = {}) {
  const code = `
    import assert from 'node:assert/strict';
    import { createHmac } from 'node:crypto';
    process.argv = [process.execPath, 'configure-email-otp.mjs', '${mode}'];
    const endpoint = 'https://xmubbpkaezlgtvxaxofg.supabase.co/functions/v1/gmail-otp';
    ${mock}
    await import(${JSON.stringify(script)});
  `;
  const env = { ...environment, ...overrides };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--input-type=module', '-e', code], {
    env, encoding: 'utf8', timeout: 10_000,
  });
}
const ok = result => assert.equal(result.status, 0, result.stderr);

test('read-only check makes exactly one GET and does not expose secrets', () => {
  const result = run('--check', `
    let count = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(options.method, 'GET'); count++;
      return { ok: true, json: async () => ({ mailer_autoconfirm: false }) };
    };
    process.on('beforeExit', () => assert.equal(count, 1));
  `);
  ok(result);
  assert.doesNotMatch(result.stdout, /test-management-token|test-client-secret|whsec_/);
});

test('missing Gmail credentials fail before any network request or hook change', () => {
  const result = run('--gmail', `globalThis.fetch = () => { throw Error('NETWORK_MUST_NOT_RUN'); };`, { GOOGLE_REFRESH_TOKEN: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Fill GMAIL_USER/);
  assert.doesNotMatch(result.stderr, /NETWORK_MUST_NOT_RUN/);
});

test('staging uploads only the signing key, checks a signed probe and never enables the hook', () => {
  const result = run('--stage', `
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push(options.method);
      if (url === endpoint) {
        assert.deepEqual(JSON.parse(options.body), { type: 'health_check' });
        const headers = options.headers;
        const key = Buffer.from(process.env.SEND_EMAIL_HOOK_SECRET.replace('v1,whsec_', ''), 'base64');
        const expected = createHmac('sha256', key).update(headers['webhook-id'] + '.' + headers['webhook-timestamp'] + '.' + options.body).digest('base64');
        assert.equal(headers['webhook-signature'], 'v1,' + expected);
        return { ok: true, json: async () => ({ ready: false }) };
      }
      if (options.method === 'POST') {
        assert.ok(url.endsWith('/secrets'));
        assert.deepEqual(JSON.parse(options.body).map(s => s.name), ['SEND_EMAIL_HOOK_SECRET']);
      }
      return { ok: true, json: async () => ({ mailer_autoconfirm: false }) };
    };
    process.on('beforeExit', () => assert.deepEqual(calls, ['GET', 'POST', 'POST']));
  `);
  ok(result);
});

test('Gmail activation verifies the connection first and sets six-digit OTP and only patches the intended Auth fields', () => {
  const result = run('--gmail', `
    let config = { mailer_autoconfirm: false, smtp_host: null };
    const calls = []; let connectionChecked = false;
    globalThis.fetch = async (url, options) => {
      calls.push(options.method);
      if (url === endpoint) {
        const payload = JSON.parse(options.body);
        assert.deepEqual(Object.keys(payload), ['type']);
        if (payload.type === 'connection_check') connectionChecked = true;
        return { ok: true, json: async () => ({ ready: true }) };
      }
      if (options.method === 'POST') {
        const secrets = JSON.parse(options.body);
        assert.deepEqual(secrets.map(s => s.name), ['SEND_EMAIL_HOOK_SECRET', 'GMAIL_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']);
        assert.equal(secrets[4].value, 'test-refresh-token');
      }
      if (options.method === 'PATCH') {
        assert.equal(connectionChecked, true);
        const payload = JSON.parse(options.body);
        assert.deepEqual(Object.keys(payload).sort(), ['mailer_otp_length', 'hook_send_email_enabled', 'hook_send_email_uri', 'hook_send_email_secrets'].sort());
        assert.equal(payload.mailer_otp_length, 6);
        config = { ...config, ...payload };
      }
      return { ok: true, json: async () => ({ ...config }) };
    };
    process.on('beforeExit', () => {
      assert.deepEqual(calls, ['GET', 'POST', 'POST', 'POST', 'PATCH', 'GET']);
      assert.equal(config.smtp_host, null);
      assert.equal(config.mailer_autoconfirm, false);
    });
  `);
  ok(result);
  assert.doesNotMatch(result.stdout, /test-refresh-token|test-management-token|whsec_/);
});

test('failed Gmail connection prevents changing live Auth delivery', () => {
  const result = run('--gmail', `
    globalThis.fetch = async (url, options) => {
      assert.notEqual(options.method, 'PATCH');
      if (url === endpoint) {
        return JSON.parse(options.body).type === 'connection_check'
          ? { ok: false, status: 502 }
          : { ok: true, json: async () => ({ ready: true }) };
      }
      return { ok: true, json: async () => ({ mailer_autoconfirm: false }) };
    };
  `);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /connection_check failed/);
});

test('a different existing email hook is never overwritten', () => {
  const result = run('--gmail', `
    globalThis.fetch = async (url, options) => {
      assert.equal(options.method, 'GET');
      return { ok: true, json: async () => ({ mailer_autoconfirm: false, hook_send_email_enabled: true, hook_send_email_uri: 'https://other.example/hook' }) };
    };
  `);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Another email hook is active/);
});

test('active hook with a mismatching local signing key cannot be rotated accidentally', () => {
  const result = run('--gmail', `
    globalThis.fetch = async (url, options) => {
      if (url === endpoint) return { ok: false, status: 401 };
      assert.equal(options.method, 'GET');
      return { ok: true, json: async () => ({ mailer_autoconfirm: false, hook_send_email_enabled: true, hook_send_email_uri: endpoint }) };
    };
  `);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /health_check failed/);
});

test('management error details redact Gmail and management credentials', () => {
  const result = run('--gmail', `
    globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ message: 'test-management-token test-refresh-token' }) });
  `);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[redacted\] \[redacted\]/);
  assert.doesNotMatch(result.stderr, /test-management-token|test-refresh-token/);
});
