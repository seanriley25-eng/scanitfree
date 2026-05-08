import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — ScanItFree',
  description: 'Get in touch with the ScanItFree team. Questions, feedback, partnership inquiries, and privacy requests.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
