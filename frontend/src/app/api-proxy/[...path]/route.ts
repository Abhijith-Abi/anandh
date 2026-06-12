import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://54.252.229.180';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');

  // Preserve query string from original request
  const { search } = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/api/${pathStr}${search}`;

  // Forward headers, stripping hop-by-hop headers
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!['host', 'connection', 'transfer-encoding'].includes(lower)) {
      headers.set(key, value);
    }
  });

  // Read body for non-GET/HEAD requests
  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
    });

    // Forward response headers, stripping hop-by-hop headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['transfer-encoding', 'connection'].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[api-proxy] Failed to reach backend:', error);
    return NextResponse.json(
      { error: 'Backend unreachable' },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
