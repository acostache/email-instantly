import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AddIcon from "@mui/icons-material/Add";

export default function Mails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/emails');
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || 'Failed to load');
        console.log({data})
        setEmails(data);
        // Do not auto-select any email by default
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = useMemo(
    () => emails.find((e) => e.id === selectedId) || null,
    [emails, selectedId]
  );

  if (loading) return <div style={{ padding: 16 }}>Loading emails…</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>;

  return (
    <>
      <div style={{ display: 'flex', height: 'calc(100vh - 20px)' }}>
        {/* Left nav: 40% width */}
        <aside style={{ width: '40%', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          <div style={{ padding: '12px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Emails</span>
          </div>
          {emails.length === 0 ? (
            <div style={{ padding: 12 }}>No emails found. Please compose one.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {emails.map((e) => {
                const isActive = e.id === selectedId;
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => setSelectedId(e.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        border: 'none',
                        borderBottom: '1px solid #f3f4f6',
                        background: isActive ? '#eff6ff' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {e.subject || '(no subject)'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>
                        To: {e.to || '-'}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right pane: 60% width */}
        <section style={{ width: '60%', overflowY: 'auto' }}>
          {!selected ? (
            <div />
          ) : (
            <div style={{ padding: 16 }}>
              <h2 style={{ margin: '0 0 8px 0' }}>{selected.subject || '(no subject)'}</h2>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 10 }}>
                <div><strong>To:</strong> {selected.to || '-'}</div>
                {selected.cc ? <div><strong>CC:</strong> {selected.cc}</div> : null}
                {selected.bcc ? <div><strong>BCC:</strong> {selected.bcc}</div> : null}
              </div>
              {selected.created_at ? (
                <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
                  {new Date(selected.created_at).toLocaleString()}
                </div>
              ) : null}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selected.body || ''}</div>
            </div>
          )}
        </section>
      </div>

      {/* Bottom-right Compose button */}
      <Link href="/mails/compose" className="btn primary" style={{ position: 'fixed', right: 24, bottom: 24, fontWeight: 500, fontSize: 12, padding: '10px 14px', borderRadius: 9999 }}>
          <AddIcon/>
      </Link>
    </>
  );
}
