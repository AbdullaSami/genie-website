'use client';

import { useState } from 'react';

interface Props {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, any>;
}

const DEFAULT_SERVICES = [
  'Brand Identity & Strategy',
  'Web Design & Development',
  '3D Design & Visualization',
  'AI Automation',
  'Marketing & Social Media',
  'Event Planning & Identity',
  'Something else',
];

export default function ContactForm({ title, subtitle, content }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const label = content?.section_label || 'Ready to Start?';
  const headline = title || "Let's build something magical";
  const sub = subtitle || "Tell us about your project and we'll make the magic happen.";
  const submitText = content?.submit_text || 'Send Message →';
  const successText = content?.success_message || "✦ Message sent! We'll be in touch soon.";

  const services =
    content?.services && Array.isArray(content.services) && content.services.length > 0
      ? content.services
      : DEFAULT_SERVICES;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }

      form.reset();
      setStatus('success');
    } catch (err) {
      console.error('[Genie] Contact form error:', err);
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <section className="cta-section" id="contact">
      <div
        className="section-label"
        style={{ justifyContent: 'center', color: 'rgba(242,242,242,.35)' }}
      >
        <span
          style={{
            background: 'rgba(242,242,242,.15)',
            width: '24px',
            height: '2px',
            display: 'inline-block',
          }}
        />
        {label}
      </div>

      <h2
        className="section-headline reveal"
        style={{ color: '#fff', textAlign: 'center', margin: '0 auto 1rem' }}
      >
        {headline}
      </h2>

      <p
        className="section-sub reveal"
        style={{
          color: 'rgba(242,242,242,.4)',
          textAlign: 'center',
          margin: '0 auto 2.5rem',
        }}
      >
        {sub}
      </p>

      <form className="contact-form reveal" id="contactForm" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fname">Name</label>
            <input
              type="text"
              id="fname"
              name="name"
              placeholder="Your name"
              required
              disabled={status === 'sending'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="femail">Email</label>
            <input
              type="email"
              id="femail"
              name="email"
              placeholder="your@email.com"
              required
              disabled={status === 'sending'}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="fservice">Service</label>
          <select id="fservice" name="service" disabled={status === 'sending'}>
            <option value="" disabled defaultValue="">
              What do you need?
            </option>
            {services.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fmsg">Message</label>
          <textarea
            id="fmsg"
            name="message"
            placeholder="Tell us about your project…"
            required
            disabled={status === 'sending'}
          />
        </div>

        {status !== 'success' && (
          <button
            type="submit"
            className="form-submit"
            disabled={status === 'sending'}
            id="contactSubmitBtn"
          >
            {status === 'sending' ? 'Sending…' : submitText}
          </button>
        )}

        {status === 'error' && (
          <p style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '.9rem' }}>
            {errorMsg}
          </p>
        )}

        {status === 'success' && (
          <div className="form-success" style={{ display: 'block' }}>
            {successText}
          </div>
        )}
      </form>
    </section>
  );
}
