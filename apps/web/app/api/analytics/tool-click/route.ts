import { NextRequest, NextResponse } from 'next/server';

function getN8nUrl(path: string): string {
  const base = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const url = getN8nUrl('tool-click');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SEO-Tools-Platform/1.0',
    };

    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret;
    }

    const payload = {
      ...data,
      serverTimestamp: new Date().toISOString(),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('n8n tool-click webhook failed:', response.status, text);
      return NextResponse.json(
        { error: 'Failed forwarding tool click to webhook', status: response.status },
        { status: 502 }
      );
    }

    const result = await response.json().catch(() => ({ success: true }));
    return NextResponse.json({ success: true, forwarded: true, result });
  } catch (error) {
    console.error('Analytics Tool Click Error:', error);
    return NextResponse.json(
      { error: 'Error saving tool click' },
      { status: 500 }
    );
  }
}