import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);

  if (submissions.size > 5000) {
    Array.from(submissions.entries()).forEach(([key, timestamps]) => {
      const fresh = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) submissions.delete(key);
      else submissions.set(key, fresh);
    });
  }

  return false;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  honeypot?: unknown;
}

function validatePayload(payload: ContactPayload): string | null {
  if (typeof payload.honeypot === 'string' && payload.honeypot.length > 0) {
    return 'BOT_DETECTED';
  }
  if (typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    return 'Name is required.';
  }
  if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'A valid email is required.';
  }
  if (typeof payload.subject !== 'string' || payload.subject.trim().length === 0) {
    return 'Subject is required.';
  }
  if (typeof payload.message !== 'string' || payload.message.trim().length < 10) {
    return 'Message must be at least 10 characters.';
  }
  if (payload.message.length > 10_000) {
    return 'Message is too long (max 10,000 characters).';
  }
  return null;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError === 'BOT_DETECTED') {
    return NextResponse.json({ success: true }, { status: 200 });
  }
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const name = (payload.name as string).trim();
  const email = (payload.email as string).trim();
  const subject = (payload.subject as string).trim();
  const message = (payload.message as string).trim();

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    console.error('Contact form: missing required env vars');
    return NextResponse.json(
      { error: 'Contact form is temporarily unavailable. Please email hello@scanitfree.com directly.' },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: `ScanItFree Contact Form <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <h2 style="font-family: sans-serif; color: #111;">New contact form submission</h2>
        <table style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">
          <tr><td style="padding-right: 12px;"><strong>From:</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding-right: 12px;"><strong>Email:</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding-right: 12px;"><strong>Subject:</strong></td><td>${escapeHtml(subject)}</td></tr>
          <tr><td style="padding-right: 12px;"><strong>IP:</strong></td><td>${escapeHtml(ip)}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-family: sans-serif; font-size: 12px; color: #6b7280;">
          Reply directly to this email to respond to ${escapeHtml(name)}.
        </p>
      `,
      text: `New contact form submission

From: ${name}
Email: ${email}
Subject: ${subject}
IP: ${ip}

---

${message}

---
Reply directly to this email to respond to ${name}.
`,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or email hello@scanitfree.com directly.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again or email hello@scanitfree.com directly.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
