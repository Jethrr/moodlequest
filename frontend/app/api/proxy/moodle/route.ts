import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || 'https://moodle50:8890';

interface MoodleProxyRequest {
  endpoint: string;
  params: Record<string, any>;
  method?: 'GET' | 'POST';
}

export async function POST(request: NextRequest) {
  try {
    // Allow TLS/SSL connections to self-signed certificates in development
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const body: MoodleProxyRequest = await request.json();
    const { endpoint, params, method = 'GET' } = body;

    // Construct the URL - if endpoint is a full URL use it, otherwise append to base URL
    let url = endpoint.startsWith('http') ? endpoint : `${MOODLE_URL}/${endpoint.replace(/^\//, '')}`;

    let response;
    if (method === 'GET') {
      // For GET requests, append params to URL
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      }
      
      const queryString = queryParams.toString();
      url = queryString ? `${url}?${queryString}` : url;
      
      console.log(`Proxying GET request to: ${url}`);
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } else {
      // For POST requests, send params in body
      console.log(`Proxying POST request to: ${url}`);
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Moodle proxy error: ${response.status} ${errorText}`);
      return NextResponse.json({ 
        error: `Moodle API error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Moodle proxy error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  } finally {
    // Reset NODE_TLS_REJECT_UNAUTHORIZED to its default
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }
  }
} 