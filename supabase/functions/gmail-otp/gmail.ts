type GmailConfig = {
  email: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};
type Mail = { to: string; subject: string; text: string; html: string };
const scope = 'https://www.googleapis.com/auth/gmail.send';

function base64(text: string) {
  return btoa(Array.from(new TextEncoder().encode(text), byte => String.fromCharCode(byte)).join(''));
}

function rawMessage(email: string, mail: Mail) {
  if (!/^[^\s@<>]+@gmail\.com$/i.test(email) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(mail.to) || /[\r\n]/.test(mail.subject)) {
    throw new Error('Invalid mail headers');
  }
  const boundary = `weather_${crypto.randomUUID()}`;
  const parts = [
    `From: Weather <${email}>`, `To: <${mail.to}>`,
    `Subject: =?UTF-8?B?${base64(mail.subject)}?=`,
    `Date: ${new Date().toUTCString()}`, 'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
  ];
  for (const [type, body] of [['plain', mail.text], ['html', mail.html]]) {
    parts.push(`--${boundary}`, `Content-Type: text/${type}; charset=UTF-8`,
      'Content-Transfer-Encoding: base64', '', base64(body).match(/.{1,76}/g)?.join('\r\n') || '');
  }
  parts.push(`--${boundary}--`, '');
  return base64(parts.join('\r\n')).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function createGmailSender(config: GmailConfig, request = fetch) {
  let cached = { token: '', expires: 0 };
  let pending: Promise<string> | undefined;
  async function accessToken(): Promise<string> {
    if (cached.expires > Date.now()) return cached.token;
    if (pending) return pending;
    pending = (async () => {
      const response = await request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId, client_secret: config.clientSecret,
          refresh_token: config.refreshToken, grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(2_000),
      });
      if (!response.ok) throw new Error('Gmail authorization failed');
      const data = await response.json();
      if (typeof data.access_token !== 'string' || !data.access_token ||
          typeof data.expires_in !== 'number' || data.expires_in <= 0 ||
          (typeof data.scope === 'string' && !data.scope.split(' ').includes(scope))) {
        throw new Error('Gmail authorization is incomplete');
      }
      cached = { token: data.access_token, expires: Date.now() + Math.max(0, data.expires_in - 60) * 1000 };
      return cached.token;
    })();
    try { return await pending; } finally { pending = undefined; }
  }
  return {
    // Checks OAuth refresh without sending mail or requesting mailbox read access.
    checkConnection: accessToken,
    async send(mail: Mail) {
      const raw = rawMessage(config.email, mail);
      const token = await accessToken();
      const mailbox = encodeURIComponent(config.email);
      const response = await request(`https://gmail.googleapis.com/gmail/v1/users/${mailbox}/messages/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(2_000),
      });
      if (!response.ok) {
        if (response.status === 401) cached = { token: '', expires: 0 };
        throw new Error('Gmail delivery failed');
      }
      const data = await response.json();
      if (typeof data.id !== 'string' || !data.id) throw new Error('Gmail delivery was not confirmed');
    },
  };
}
