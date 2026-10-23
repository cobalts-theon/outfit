type Mail = { to: string; subject: string; text: string; html: string };

type MailDependencies = {
  configured: boolean;
  verify: (body: string, headers: Record<string, string>) => unknown;
  send: (mail: Mail) => Promise<unknown>;
  checkConnection: () => Promise<unknown>;
};

const titles: Record<string, string> = {
  signup: 'Xác nhận tài khoản Weather',
  recovery: 'Đặt lại mật khẩu Weather',
  magiclink: 'Mã đăng nhập Weather',
  invite: 'Lời mời tham gia Weather',
  reauthentication: 'Xác minh tài khoản Weather',
  email_change: 'Xác nhận thay đổi email Weather',
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function message(email: unknown, token: unknown, subject: string): Mail {
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    throw new Error('Invalid recipient');
  }
  if (typeof token !== 'string' || !/^\d{6,10}$/.test(token)) {
    throw new Error('Invalid OTP');
  }
  return {
    to: email,
    subject,
    text: `${subject}\n\nMã OTP của bạn: ${token}\n\nNhập mã này trong ứng dụng Weather. Không chia sẻ mã với người khác. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px"><h2>${subject}</h2><p>Mã OTP của bạn:</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px">${token}</p><p>Nhập mã này trong ứng dụng Weather. Không chia sẻ mã với người khác.</p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p></div>`,
  };
}

function messages(payload: Record<string, unknown>): Mail[] {
  const user = record(payload.user);
  const email = record(payload.email_data);
  const action = email.email_action_type;
  if (typeof action !== 'string' || !Object.hasOwn(titles, action)) {
    throw new Error('Unsupported email action');
  }
  if (action === 'email_change') {
    // Secure change sends separate OTPs to the old and new addresses.
    if (email.token && email.token_new) {
      return [
        message(user.email, email.token, titles[action]),
        message(user.new_email, email.token_new, titles[action]),
      ];
    }
    return [message(user.new_email, email.token_new || email.token, titles[action])];
  }
  return [message(user.email, email.token, titles[action])];
}

export function createGmailOtpHandler(dependencies: MailDependencies) {
  // Coalesce Auth retries within one warm instance. Failed sends remain retryable.
  const deliveries = new Map<string, { expires: number; pending: Promise<void> }>();
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    }
    const body = await request.text();
    if (body.length > 131_072) return Response.json({ error: 'Payload too large' }, { status: 413 });

    let payload: Record<string, unknown>;
    try {
      // Standard Webhooks verifies signature AND timestamp before reading recipients.
      payload = record(dependencies.verify(body, Object.fromEntries(request.headers)));
    } catch {
      return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }
    if (payload.type === 'health_check') {
      return Response.json({ ready: dependencies.configured });
    }
    if (!dependencies.configured) {
      return Response.json({ error: 'Gmail sender is not configured' }, { status: 503 });
    }
    if (payload.type === 'connection_check') {
      try {
        await dependencies.checkConnection();
        return Response.json({ ready: true });
      } catch {
        return Response.json({ error: 'Gmail connection failed' }, { status: 502 });
      }
    }

    let mail: Mail[];
    try {
      mail = messages(payload);
    } catch {
      return Response.json({ error: 'Invalid authentication email' }, { status: 422 });
    }
    const id = request.headers.get('webhook-id');
    if (!id) return Response.json({ error: 'Missing webhook ID' }, { status: 401 });
    for (const [key, delivery] of deliveries) {
      if (delivery.expires < Date.now()) deliveries.delete(key);
    }
    let delivery = deliveries.get(id);
    if (!delivery) {
      if (deliveries.size >= 2_000) {
        return Response.json({ error: 'Sender is busy' }, { status: 503 });
      }
      delivery = {
        expires: Date.now() + 5 * 60_000,
        pending: (async () => {
          for (const item of mail) await dependencies.send(item);
        })(),
      };
      deliveries.set(id, delivery);
    }
    try {
      await delivery.pending;
      return Response.json({});
    } catch {
      deliveries.delete(id);
      // Never return SMTP errors, email addresses, OTPs or credentials to callers/logs.
      return Response.json({ error: 'Email delivery failed' }, { status: 502 });
    }
  };
}
