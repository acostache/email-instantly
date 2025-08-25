export default async function handler(req, res) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    if (req.method === 'POST') {
        try {
            const r = await fetch(`${backendUrl}/email`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(req.body || {}),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) return res.status(r.status).json(data);
            return res.status(201).json(data);
        } catch (err) {
            return res.status(500).json({error: err?.message || 'Unknown error'});
        }
    }

    // Default: GET proxy
    try {
        const r = await fetch(`${backendUrl}/emails`);
        if (!r.ok) {
            const text = await r.text();
            return res.status(r.status).json({error: `Backend error: ${text}`});
        }
        const data = await r.json();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({error: err?.message || 'Unknown error'});
    }
}
