'use client';

import { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  honeypot: '',
};

export default function ContactPage() {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  const validate = (): string | null => {
    if (!data.name.trim()) return 'Please enter your name.';
    if (!data.email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return 'Please enter a valid email address.';
    }
    if (!data.subject.trim()) return 'Please enter a subject.';
    if (!data.message.trim()) return 'Please enter a message.';
    if (data.message.trim().length < 10) {
      return 'Message must be at least 10 characters.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      setData(INITIAL_DATA);
      setState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-3">Contact Us</h1>
      <p className="text-muted text-sm leading-relaxed mb-10">
        Questions, feedback, partnership inquiries, or privacy requests — we read everything
        and respond within two business days.
      </p>

      <div className="mb-10 bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted mb-4">
          Direct contact
        </h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-[var(--text)]">General inquiries</dt>
            <dd className="text-muted">
              <a href="mailto:hello@scanitfree.com" className="text-accent hover:underline">
                hello@scanitfree.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--text)]">Privacy &amp; data requests</dt>
            <dd className="text-muted">
              <a href="mailto:privacy@scanitfree.com" className="text-accent hover:underline">
                privacy@scanitfree.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--text)]">Legal</dt>
            <dd className="text-muted">
              <a href="mailto:legal@scanitfree.com" className="text-accent hover:underline">
                legal@scanitfree.com
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Honeypot */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 overflow-hidden">
          <label htmlFor="website">
            Website (leave blank)
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={data.honeypot}
              onChange={update('honeypot')}
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-heading font-medium text-[var(--text)]">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autoComplete="name"
              value={data.name}
              onChange={update('name')}
              disabled={state === 'submitting'}
              className="mt-1 block w-full bg-surface border border-border rounded-lg px-3 py-2 text-[var(--text)] text-sm font-mono outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-heading font-medium text-[var(--text)]">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={update('email')}
              disabled={state === 'submitting'}
              className="mt-1 block w-full bg-surface border border-border rounded-lg px-3 py-2 text-[var(--text)] text-sm font-mono outline-none focus:border-accent transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-heading font-medium text-[var(--text)]">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={data.subject}
            onChange={update('subject')}
            disabled={state === 'submitting'}
            className="mt-1 block w-full bg-surface border border-border rounded-lg px-3 py-2 text-[var(--text)] text-sm font-mono outline-none focus:border-accent transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-heading font-medium text-[var(--text)]">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={data.message}
            onChange={update('message')}
            disabled={state === 'submitting'}
            className="mt-1 block w-full bg-surface border border-border rounded-lg px-3 py-2 text-[var(--text)] text-sm font-mono outline-none focus:border-accent transition-colors resize-y disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-muted">
            Please don&apos;t include sensitive information (full SSN, banking details, passwords)
            in this form.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="text-accent underline underline-offset-2 hover:text-[var(--text)]">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-accent underline underline-offset-2 hover:text-[var(--text)]">
              Terms of Service
            </a>
            .
          </p>
          <button
            type="submit"
            disabled={state === 'submitting'}
            className={`px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
              state === 'submitting'
                ? 'bg-border text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:brightness-110 cursor-pointer'
            }`}
          >
            {state === 'submitting' ? 'Sending...' : 'Send message'}
          </button>
        </div>

        {state === 'success' && (
          <div
            role="status"
            className="rounded-lg bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-400"
          >
            Thanks — your message is on its way. We&apos;ll get back to you within two business days.
          </div>
        )}

        {state === 'error' && errorMessage && (
          <div
            role="alert"
            className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400"
          >
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
