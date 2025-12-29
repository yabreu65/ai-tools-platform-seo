import { NextRequest, NextResponse } from 'next/server';

// Helper to build n8n webhook URL safely
function getN8nUrl(path: string): string {
  const base = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  // Ensure no double slashes
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Forward tool usage to n8n to avoid browser CORS issues (optional)
    const url = getN8nUrl('tool-usage');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SEO-Tools-Platform/1.0',
    };

    // Optional shared secret header
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret;
    }

    const payload = {
      ...data,
      serverTimestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        // Protect against hanging calls
        signal: AbortSignal.timeout(5000), // Reducido a 5 segundos
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn('n8n tool-usage webhook failed (non-critical):', response.status, text);
        // Retornar éxito aunque n8n falle - no es crítico
        return NextResponse.json({ success: true, forwarded: false, reason: 'n8n unavailable' });
      }

      const result = await response.json().catch(() => ({ success: true }));
      return NextResponse.json({ success: true, forwarded: true, result });
    } catch (fetchError) {
      // Si n8n no está disponible, continuar sin error
      console.warn('n8n not available (non-critical):', fetchError);
      return NextResponse.json({ success: true, forwarded: false, reason: 'n8n not available' });
    }
  } catch (error) {
    console.error('Analytics Tool Usage Error:', error);
    // Retornar éxito para no bloquear la funcionalidad principal
    return NextResponse.json({ success: true, saved: false });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    
    // Retornamos datos mock
    const mockToolUsage: any[] = [];
    
    return NextResponse.json(mockToolUsage);
  } catch (error) {
    console.error('Analytics Tool Usage GET Error:', error);
    return NextResponse.json(
      { error: 'Error fetching tool usage' },
      { status: 500 }
    );
  }
}