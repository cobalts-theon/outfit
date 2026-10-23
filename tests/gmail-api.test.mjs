import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGmailSender } from '../supabase/functions/gmail-otp/gmail.ts';

const config = {
  email: 'sender@gmail.com', clientId: 'client-id',
  clientSecret: 'client-secret', refreshToken: 'refresh-token',
};
const mail = {
  to: 'recipient@example.com', subject: 'Xác nhận tài khoản Weather',
  text: 'Mã OTP: 001234', html: '<p>Mã OTP: 001234</p>',
};
const authorized = (extra = {}) => Response.json({
  access_token: 'access-token', expires_in: 3600,
  scope: 'https://www.googleapis.com/auth/gmail.send', ...extra,
});

test('OAuth probe refreshes a token without sending email and caches concurrent calls', async () => {
  let calls = 0;
  const sender = createGmailSender(config, async (url, options) => {
    calls++;
    assert.equal(url, 'https://oauth2.googleapis.com/token');
    assert.equal(options.method, 'POST');
    assert.deepEqual(Object.fromEntries(options.body), {
      client_id: config.clientId, client_secret: config.clientSecret,
      refresh_token: config.refreshToken, grant_type: 'refresh_token',
    });
    return authorized();
  });
  await Promise.all([sender.checkConnection(), sender.checkConnection()]);
  await sender.checkConnection();
  assert.equal(calls, 1);
});

test('Gmail API receives MIME with Vietnamese text, leading zero OTP and the configured mailbox', async () => {
  let sent = false;
  const sender = createGmailSender(config, async (url, options) => {
    if (url.includes('oauth2')) return authorized();
    sent = true;
    assert.equal(url, 'https://gmail.googleapis.com/gmail/v1/users/sender%40gmail.com/messages/send');
    assert.equal(options.headers.Authorization, 'Bearer access-token');
    const { raw } = JSON.parse(options.body);
    assert.match(raw, /^[A-Za-z0-9_-]+$/);
    const mime = Buffer.from(raw, 'base64url').toString('utf8');
    assert.match(mime, /From: Weather <sender@gmail.com>/);
    assert.match(mime, /To: <recipient@example.com>/);
    const subject = mime.match(/Subject: =\?UTF-8\?B\?(.+)\?=/)[1];
    assert.equal(Buffer.from(subject, 'base64').toString('utf8'), mail.subject);
    const bodies = [...mime.matchAll(/Content-Transfer-Encoding: base64\r\n\r\n([\s\S]*?)\r\n--/g)];
    assert.deepEqual(bodies.map(body => Buffer.from(body[1], 'base64').toString('utf8')), [mail.text, mail.html]);
    assert.doesNotMatch(mime, /client-secret|refresh-token|access-token/);
    return Response.json({ id: 'message-id' });
  });
  await sender.send(mail);
  assert.equal(sent, true);
});

test('authorization failure is retryable and provider secrets stay out of errors', async () => {
  let calls = 0;
  const sender = createGmailSender(config, async () => {
    calls++;
    return calls === 1
      ? new Response('private provider details client-secret', { status: 400 }) : authorized();
  });
  await assert.rejects(sender.checkConnection(), { message: 'Gmail authorization failed' });
  await sender.checkConnection();
  assert.equal(calls, 2);
});

test('missing send scope or invalid OAuth response prevents sending', async () => {
  for (const extra of [{ scope: 'openid' }, { access_token: '' }, { expires_in: 0 }]) {
    let calls = 0;
    const sender = createGmailSender(config, async () => { calls++; return authorized(extra); });
    await assert.rejects(sender.send(mail), /authorization is incomplete/);
    assert.equal(calls, 1);
  }
});

test('rejected Gmail delivery clears stale access token and hides provider details', async () => {
  let refreshes = 0;
  let sends = 0;
  const sender = createGmailSender(config, async url => {
    if (url.includes('oauth2')) { refreshes++; return authorized(); }
    sends++;
    return sends === 1 ? new Response('private details', { status: 401 }) : Response.json({ id: 'sent' });
  });
  await assert.rejects(sender.send(mail), { message: 'Gmail delivery failed' });
  await sender.send(mail);
  assert.equal(refreshes, 2);
});

test('header injection is rejected before any OAuth or Gmail request', async () => {
  const sender = createGmailSender(config, async () => { throw Error('NETWORK_MUST_NOT_RUN'); });
  await assert.rejects(sender.send({ ...mail, to: 'victim@example.com\r\nBcc: other@example.com' }), /Invalid mail headers/);
  await assert.rejects(sender.send({ ...mail, subject: 'Subject\r\nBcc: other@example.com' }), /Invalid mail headers/);
});
