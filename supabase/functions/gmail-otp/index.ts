import { Webhook } from 'standardwebhooks';
import { createGmailOtpHandler } from './handler.ts';
import { createGmailSender } from './gmail.ts';

const email = Deno.env.get('GMAIL_USER')?.trim() || '';
const clientId = Deno.env.get('GOOGLE_CLIENT_ID')?.trim() || '';
const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')?.trim() || '';
const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN')?.trim() || '';
const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') || '';
const configured = /^[^\s@<>]+@gmail\.com$/i.test(email) &&
  Boolean(clientId && clientSecret && refreshToken);
const webhook = secret ? new Webhook(secret.replace(/^v1,whsec_/, '')) : null;
const sender = createGmailSender({ email, clientId, clientSecret, refreshToken });

Deno.serve(createGmailOtpHandler({
  configured,
  verify(body, headers) {
    if (!webhook) throw new Error('Hook signing is not configured');
    return webhook.verify(body, headers);
  },
  checkConnection: sender.checkConnection,
  send: sender.send,
}));
