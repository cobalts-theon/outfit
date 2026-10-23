// Server administration only. Never expose these credentials through Expo variables.
import { createHmac, randomUUID } from 'node:crypto';

const modes = process.argv.slice(2);
if (modes.length > 1 || modes.some(mode => !['--check', '--stage', '--gmail'].includes(mode))) {
  throw new Error('Use --check (read only), --stage (prepare hook signing), or --gmail (enable direct Gmail).');
}
const mode = modes[0] || '--check';
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error('Set SUPABASE_ACCESS_TOKEN in the private management environment.');
const project = 'xmubbpkaezlgtvxaxofg';
const base = `https://api.supabase.com/v1/projects/${project}`;
const endpoint = `https://${project}.supabase.co/functions/v1/gmail-otp`;
const secret = process.env.SEND_EMAIL_HOOK_SECRET || '';
const email = process.env.GMAIL_USER?.trim().toLowerCase() || '';
const oauthKeys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
const oauth = oauthKeys.map(name => ({ name, value: process.env[name]?.trim() || '' }));

if (mode !== '--check' && !/^v1,whsec_[A-Za-z0-9+/]{43}=$/.test(secret)) {
  throw new Error('Set the private SEND_EMAIL_HOOK_SECRET before preparing this hook. No changes applied.');
}
if (mode === '--gmail' && (!/^[^\s@<>]+@gmail\.com$/.test(email) || oauth.some(item => !item.value))) {
  throw new Error('Fill GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN first. No changes applied.');
}

function redact(message) {
  for (const value of [token, secret, ...oauth.flatMap(item => [process.env[item.name], item.value])].filter(Boolean)) {
    message = message.replaceAll(value, '[redacted]');
  }
  return message;
}

async function management(path, method = 'GET', body) {
  const result = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20_000),
  });
  if (!result.ok) {
    const error = await result.json().catch(() => ({}));
    throw new Error(`Management ${method} failed (${result.status}): ${redact(String(error.message ?? error.error ?? 'No details'))}`);
  }
  // Never print or retain secret values from a write response.
  return method === 'GET' ? result.json() : undefined;
}

async function probe(type) {
  const body = JSON.stringify({ type });
  const id = randomUUID();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const key = Buffer.from(secret.replace('v1,whsec_', ''), 'base64');
  const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': `v1,${signature}`,
    },
    body,
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`Gmail hook ${type} failed (${response.status}). Auth hook settings have not been changed by this run.`);
  }
  return response.json();
}

const config = await management('/config/auth');
if (mode === '--check') {
  console.log(JSON.stringify({
    gmailHookEnabled: config.hook_send_email_enabled === true,
    gmailHookMatchesEndpoint: config.hook_send_email_uri === endpoint,
    customSmtpConfigured: Boolean(config.smtp_host?.trim()),
    emailOtpLength: config.mailer_otp_length,
    emailConfirmationsRequired: config.mailer_autoconfirm === false,
  }, null, 2));
} else {
  if (config.mailer_autoconfirm !== false) {
    throw new Error('Email confirmation must remain enabled. No changes applied.');
  }
  if (config.hook_send_email_enabled && config.hook_send_email_uri !== endpoint) {
    throw new Error('Another email hook is active. It has not been replaced.');
  }
  // An active hook must keep its signing key; do not rotate an unknown key mid-request.
  if (config.hook_send_email_enabled) {
    await probe('health_check');
  }
  const secrets = [{ name: 'SEND_EMAIL_HOOK_SECRET', value: secret }];
  if (mode === '--gmail') {
    secrets.push({ name: 'GMAIL_USER', value: email }, ...oauth);
  }
  await management('/secrets', 'POST', secrets);
  const health = await probe('health_check');
  if (mode === '--stage') {
    console.log(`Signed hook verified. Gmail credentials ready: ${health.ready === true}. Auth delivery settings were not changed.`);
  } else {
    if (health.ready !== true) throw new Error('Gmail credentials are not ready in the function. Email hook was not enabled.');
    // Authenticate to Gmail without sending any email before changing live Auth delivery.
    const connection = await probe('connection_check');
    if (connection.ready !== true) throw new Error('Gmail connection was not confirmed. Email hook was not enabled.');
    await management('/config/auth', 'PATCH', {
      mailer_otp_length: 6,
      hook_send_email_enabled: true,
      hook_send_email_uri: endpoint,
      hook_send_email_secrets: secret,
    });
    const saved = await management('/config/auth');
    if (saved.mailer_otp_length !== 6 || saved.hook_send_email_enabled !== true || saved.hook_send_email_uri !== endpoint) {
      throw new Error('Hook configuration readback differs. Inspect the Dashboard.');
    }
    console.log('Direct Gmail hook enabled and read back. Supabase SMTP and hosted email templates were not changed.');
    console.log('Google OAuth refresh verified; request a fresh OTP in the app to verify Gmail API delivery. No test email was sent.');
  }
}
