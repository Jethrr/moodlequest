import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

// Add NODE_TLS_REJECT_UNAUTHORIZED=0 to avoid SSL certificate errors in development
// WARNING: This should not be used in production!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(req: NextRequest) {
  // ... rest of your existing function
  // But in the fetch calls, use a custom fetch function that handles certificates consistently:
  
  try {
    const { username, password } = await req.json();
    
    // Ensure username and password are provided
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    
    // Set up URLs for Moodle API
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL;
    const service = 'modquest'; 
    const tokenUrl = `${moodleUrl}/login/token.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&service=${service}`;
    
    console.log("Sign-in attempt for user:", username);
    console.log("Fetching token from:", tokenUrl);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable this to ignore certificate validation errors in development
      // DO NOT USE IN PRODUCTION!
      agent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });
    
    // ... rest of your existing code
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
} 