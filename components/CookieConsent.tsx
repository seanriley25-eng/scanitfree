'use client';

import { useEffect, useState } from 'react';

type ConsentChoice = 'granted' | 'denied';

interface ConsentState {
  ad_storage: ConsentChoice;
  ad_user_data: ConsentChoice;
  ad_personalization: ConsentChoice;
  analytics_storage: ConsentChoice;
  functionality_storage: ConsentChoice;
  personalization_storage: ConsentChoice;
  security_storage: ConsentChoice;
}

const STORAGE_KEY = 'scanitfree_consent_v1';

const ALL_GRANTED: ConsentState = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  personalization_storage: 'granted',
  security_storage: 'granted',
};

const ALL_DENIED: ConsentState = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
};

function updateGoogleConsent(state: ConsentState) {
  if (typeof window === 'undefined') return;
  // @ts-expect-error gtag is loaded via inline script
  window.gtag = window.gtag || function (...args: unknown[]) {
    // @ts-expect-error dataLayer pushed by gtag bootstrap
    (window.dataLayer = window.dataLayer || []).push(args);
  };
  // @ts-expect-error gtag is loaded via inline script
  window.gtag('consent', 'update', state);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(ALL_DENIED);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(stored) as ConsentState;
        setConsent(parsed);
        updateGoogleConsent(parsed);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowCustomize(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-banner', handler);
    return () => window.removeEventListener('open-cookie-banner', handler);
  }, []);

  const persistAndClose = (state: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
    setConsent(state);
    updateGoogleConsent(state);
    setVisible(false);
    setShowCustomize(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface shadow-2xl"
    >
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        {!showCustomize ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              <p className="font-semibold text-[var(--text)]">We use cookies</p>
              <p className="mt-1">
                We use cookies and similar technologies to operate ScanItFree, analyze usage,
                and serve advertising. You can accept all, reject non-essential, or customize
                your preferences.{' '}
                <a
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-[var(--text)]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setShowCustomize(true)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-accent-dim"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => persistAndClose(ALL_DENIED)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-accent-dim"
              >
                Reject all
              </button>
              <button
                type="button"
                onClick={() => persistAndClose(ALL_GRANTED)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <CustomizePanel
            initial={consent}
            onSave={persistAndClose}
            onCancel={() => setShowCustomize(false)}
          />
        )}
      </div>
    </div>
  );
}

interface CustomizePanelProps {
  initial: ConsentState;
  onSave: (state: ConsentState) => void;
  onCancel: () => void;
}

function CustomizePanel({ initial, onSave, onCancel }: CustomizePanelProps) {
  const [analytics, setAnalytics] = useState(initial.analytics_storage === 'granted');
  const [ads, setAds] = useState(initial.ad_storage === 'granted');
  const [personalization, setPersonalization] = useState(
    initial.personalization_storage === 'granted'
  );

  const save = () => {
    onSave({
      ad_storage: ads ? 'granted' : 'denied',
      ad_user_data: ads ? 'granted' : 'denied',
      ad_personalization: ads ? 'granted' : 'denied',
      analytics_storage: analytics ? 'granted' : 'denied',
      personalization_storage: personalization ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-semibold text-[var(--text)]">Cookie preferences</p>
        <p className="mt-1 text-sm text-muted">
          Choose which categories of cookies you allow. Essential cookies are always on
          because the site cannot function without them.
        </p>
      </div>

      <ul className="space-y-3 divide-y divide-border border-y border-border">
        <ToggleRow
          title="Essential"
          description="Required for the site to work (cookie consent storage, security)."
          checked
          disabled
        />
        <ToggleRow
          title="Analytics"
          description="Helps us understand how visitors use the site (Google Analytics)."
          checked={analytics}
          onChange={setAnalytics}
        />
        <ToggleRow
          title="Advertising"
          description="Used by Google AdSense and other ad partners to serve relevant ads."
          checked={ads}
          onChange={setAds}
        />
        <ToggleRow
          title="Personalization"
          description="Allows the site to remember preferences for a customized experience."
          checked={personalization}
          onChange={setPersonalization}
        />
      </ul>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-accent-dim"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Save preferences
        </button>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}

function ToggleRow({ title, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <li className="flex items-start justify-between gap-4 pt-3 first:pt-0">
      <div className="text-sm">
        <p className="font-medium text-[var(--text)]">{title}</p>
        <p className="mt-0.5 text-muted">{description}</p>
      </div>
      <label className={`relative inline-flex shrink-0 cursor-pointer items-center ${disabled ? 'opacity-60' : ''}`}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <div className="h-6 w-11 rounded-full bg-muted/30 transition-colors peer-checked:bg-accent peer-disabled:cursor-not-allowed" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </label>
    </li>
  );
}
