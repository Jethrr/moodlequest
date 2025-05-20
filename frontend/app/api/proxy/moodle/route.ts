import { NextRequest, NextResponse } from 'next/server';

// Middleware to proxy requests to Moodle and avoid CORS/DNS issues
export async function POST(request: NextRequest) {
  try {
    const { endpoint, params } = await request.json();
    
    console.log(`Proxying request to Moodle endpoint: ${endpoint}`);
    console.log('With params:', params);
    
    // Construct the full URL - use direct IP address to avoid DNS issues
    // Make sure the URL includes the protocol
    let moodleBaseUrl = process.env.MOODLE_URL || 'http://moodle50:8890';
    
    // Ensure base URL has protocol
    if (!moodleBaseUrl.startsWith('http://') && !moodleBaseUrl.startsWith('https://')) {
      moodleBaseUrl = `http://${moodleBaseUrl}`;
    }
    
    // Ensure endpoint starts with slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${moodleBaseUrl}${formattedEndpoint}`;
    
    console.log(`Base Moodle URL: ${moodleBaseUrl}`);
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    const fullUrl = queryString 
      ? `${url}${url.includes('?') ? '&' : '?'}${queryString}`
      : url;
    
    console.log(`Full URL: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000), // 15 seconds timeout
      });
      
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read error response';
        }
        
        console.error(`Moodle API error (${response.status}): ${errorText}`);
        return NextResponse.json(
          { success: false, error: `Moodle API error: ${response.statusText || 'Unknown error'}` },
          { status: response.status }
        );
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Moodle response received successfully');
        return NextResponse.json(data);
      } else {
        const text = await response.text();
        console.log('Received non-JSON response from Moodle');
        // Try to parse as JSON anyway in case the Content-Type header is wrong
        try {
          const data = JSON.parse(text);
          return NextResponse.json(data);
        } catch (e) {
          // Not JSON, return as text
          return NextResponse.json({ success: true, message: text });
        }
      }
    } catch (fetchError) {
      console.error('Fetch error in proxy:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: fetchError instanceof Error 
            ? `Fetch error: ${fetchError.message}` 
            : 'Failed to fetch from Moodle server'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to proxy request to Moodle' 
      },
      { status: 500 }
    );
  }
} 