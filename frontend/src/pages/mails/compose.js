import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ComposeMailPage() {
  const [form, setForm] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || 'Failed to send');
      router.push('/mails');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({ to: '', cc: '', bcc: '', subject: '', body: '' });
    router.push('/mails');
  };

  // Pseudo-stream the generated content into the fields for a nicer UX
  const streamIntoFields = (subject, body) => {
    setForm((f) => ({ ...f, subject: '', body: '' }));
    let si = 0;
    let bi = 0;
    const sInt = setInterval(() => {
      si++;
      setForm((f) => ({ ...f, subject: subject.slice(0, si) }));
      if (si >= subject.length) clearInterval(sInt);
    }, 15);
    const bInt = setInterval(() => {
      bi += 3; // add a few chars per tick for body
      setForm((f) => ({ ...f, body: body.slice(0, bi) }));
      if (bi >= body.length) clearInterval(bInt);
    }, 10);
  };

  const runAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setError(null);
    try {
      const r = await fetch(`${backendUrl}/ai/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const res = await r.json();
      if (!r.ok) throw new Error(res?.error || 'AI compose failed');

      // Stream into fields
      streamIntoFields(res.subject || '', res.body || '');
      setAiOpen(false);
      setAiPrompt('');
    } catch (e) {
      setError(e.message || 'AI failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ marginBottom: 16 }}>Compose Email</h1>
        <button
          type="button"
          className="btn secondary"
          onClick={() => setAiOpen(true)}
          disabled={aiLoading || submitting}
          title="Generate with AI"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          AI ✨
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error ? <div style={{ color: 'red', marginBottom: 8 }}>{error}</div> : null}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label className="field">
            <span>To *</span>
            <input
              type="text"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              placeholder="recipient@example.com"
              required
            />
          </label>
          <label className="field">
            <span>CC</span>
            <input
              type="text"
              value={form.cc}
              onChange={(e) => setForm({ ...form, cc: e.target.value })}
              placeholder="cc1@example.com, cc2@example.com"
            />
          </label>
          <label className="field">
            <span>BCC</span>
            <input
              type="text"
              value={form.bcc}
              onChange={(e) => setForm({ ...form, bcc: e.target.value })}
              placeholder="bcc1@example.com, bcc2@example.com"
            />
          </label>
        </div>
        <label className="field" style={{ marginTop: 16, display: 'block' }}>
          <span>Subject *</span>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Subject"
            required
            style={{ width: '100%' }}
          />
        </label>
        <label className="field" style={{ marginTop: 16, display: 'block' }}>
          <span>Body</span>
          <textarea
            rows={12}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write your message..."
            style={{ width: '100%' }}
          />
        </label>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button type="button" className="btn secondary" onClick={handleCancel} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send'}</button>
        </div>
      </form>

      {aiOpen && (
        <div className="modal-overlay" onClick={() => !aiLoading && setAiOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Describe the email</h3>
              <button className="icon-button" onClick={() => !aiLoading && setAiOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginTop: 0, color: '#6b7280' }}>Example: "Meeting request for Tuesday"</p>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What should the email be about?"
                style={{ width: '100%' }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setAiOpen(false)} disabled={aiLoading}>Cancel</button>
              <button className="btn primary" onClick={runAI} disabled={aiLoading || !aiPrompt.trim()}>{aiLoading ? 'Thinking…' : 'Generate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
