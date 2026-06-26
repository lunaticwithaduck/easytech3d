import { type NextRequest, NextResponse } from 'next/server';

// STL print-quote upload. Mutations normally go through Server Actions, but file uploads use a
// Route Handler (the sanctioned pattern for uploads): it forwards the multipart body to the backend
// over HTTP, keeping BACKEND_API_URL/TOKEN server-side. Browser → same-origin (no CORS, no token
// exposure) → backend. The body carries `files` (STL blobs) + `payload` (JSON quote metadata).

const BASE = process.env.BACKEND_API_URL;
const TOKEN = process.env.BACKEND_API_TOKEN;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!BASE) {
    return NextResponse.json({ error: 'Backend is not configured.' }, { status: 500 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Невалидна заявка.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/print-quotes`, {
      method: 'POST',
      // Forward the multipart body verbatim; fetch sets the correct boundary content-type.
      headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : undefined,
      body: form,
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as unknown;
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Неуспешно изпращане на заявката.' },
        { status: res.status },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Възникна грешка при изпращането.' }, { status: 502 });
  }
}
