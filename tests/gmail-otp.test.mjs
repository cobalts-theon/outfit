import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGmailOtpHandler } from '../supabase/functions/gmail-otp/handler.ts';

const event = (action = 'signup', token = '012345') => ({
  user: { email: 'user@example.com' },
  email_data: { email_action_type: action, token, redirect_to: 'http://localhost:3000/' },
});
function request(payload, id = 'message-1', signature = 'valid') {
  return new Request('https://example.com/gmail-otp', {
    method: 'POST',
    headers: { 'webhook-id': id, 'webhook-signature': signature },
    body: JSON.stringify(payload),
  });
}
function setup(overrides = {}) {
  const sent = [];
  const handler = createGmailOtpHandler({
    configured: true,
    verify(body, headers) {
      if (headers['webhook-signature'] !== 'valid') throw new Error('Invalid signature');
      return JSON.parse(body);
    },
    send: async mail => { sent.push(mail); },
    checkConnection: async () => {},
    ...overrides,
  });
  return { handler, sent };
}

test('signup/recovery preserve leading zeroes, send code only, and disclose no OTP in responses', async () => {
  const { handler, sent } = setup();
  for (const action of ['signup', 'recovery']) {
    const response = await handler(request(event(action), action));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  }
  assert.equal(sent.length, 2);
  for (const mail of sent) {
    assert.equal(mail.to, 'user@example.com');
    assert.match(mail.text, /012345/);
    assert.match(mail.html, /012345/);
    assert.doesNotMatch(mail.html + mail.text, /localhost|https?:|<a\b|token_hash/i);
  }
  assert.notEqual(sent[0].subject, sent[1].subject);
});

test('unsigned requests cannot send mail or probe Gmail credentials', async () => {
  let probes = 0;
  const { handler, sent } = setup({ checkConnection: async () => { probes++; } });
  for (const payload of [event(), { type: 'connection_check' }, { type: 'health_check' }]) {
    assert.equal((await handler(request(payload, 'bad', 'invalid'))).status, 401);
  }
  assert.equal(sent.length, 0);
  assert.equal(probes, 0);
});

test('a signed health check reports missing Gmail without enabling or sending anything', async () => {
  const { handler, sent } = setup({ configured: false });
  const response = await handler(request({ type: 'health_check' }));
  assert.deepEqual(await response.json(), { ready: false });
  assert.equal((await handler(request(event()))).status, 503);
  assert.equal(sent.length, 0);
});

test('a signed connection check tests Gmail login without sending an email', async () => {
  let probes = 0;
  const { handler, sent } = setup({ checkConnection: async () => { probes++; } });
  const response = await handler(request({ type: 'connection_check' }));
  assert.deepEqual(await response.json(), { ready: true });
  assert.equal(probes, 1);
  assert.equal(sent.length, 0);
});

test('failed Gmail connection returns no provider credentials or raw error', async () => {
  const { handler } = setup({ checkConnection: async () => { throw new Error('private Gmail password'); } });
  const response = await handler(request({ type: 'connection_check' }));
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /private Gmail password/);
});

test('invalid recipient, token and unsupported action never reach the mail transport', async () => {
  const { handler, sent } = setup();
  const badRecipient = event();
  badRecipient.user.email = 'user@example.com\r\nBcc: attacker@example.com';
  for (const payload of [badRecipient, event('signup', '123'), event('signup', '<script>'), event('unexpected')]) {
    assert.equal((await handler(request(payload))).status, 422);
  }
  assert.equal(sent.length, 0);
});

test('successful delivery and concurrent retries with the same webhook ID send once per instance', async () => {
  let sends = 0;
  let complete;
  const waiting = new Promise(resolve => { complete = resolve; });
  const { handler } = setup({ send: async () => { sends++; await waiting; } });
  const first = handler(request(event()));
  const second = handler(request(event()));
  complete();
  assert.equal((await first).status, 200);
  assert.equal((await second).status, 200);
  assert.equal((await handler(request(event()))).status, 200);
  assert.equal(sends, 1);
});

test('failed delivery is retryable and does not return Gmail error text', async () => {
  let sends = 0;
  const { handler } = setup({ send: async () => { if (++sends === 1) throw new Error('private token 012345'); } });
  const failed = await handler(request(event()));
  assert.equal(failed.status, 502);
  assert.doesNotMatch(await failed.text(), /private|012345/);
  assert.equal((await handler(request(event()))).status, 200);
  assert.equal(sends, 2);
});

test('secure email change maps old/new OTPs and validates both before sending', async () => {
  const { handler, sent } = setup();
  const payload = event('email_change');
  payload.user.new_email = 'new@example.com';
  payload.email_data.token_new = '098765';
  assert.equal((await handler(request(payload))).status, 200);
  assert.deepEqual(sent.map(mail => [mail.to, mail.text.includes('012345')]), [
    ['user@example.com', true], ['new@example.com', false],
  ]);
  assert.match(sent[1].text, /098765/);
  payload.email_data.token_new = 'invalid';
  assert.equal((await handler(request(payload, 'invalid-change'))).status, 422);
  assert.equal(sent.length, 2);
});

test('wrong methods and oversized payloads are rejected without delivery', async () => {
  const { handler, sent } = setup();
  assert.equal((await handler(new Request('https://example.com'))).status, 405);
  assert.equal((await handler(request({ text: 'x'.repeat(131_073) }))).status, 413);
  assert.equal(sent.length, 0);
});
