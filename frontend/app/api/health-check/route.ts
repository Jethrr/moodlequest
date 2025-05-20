import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This API health check tests if our proxy can reach the Moodle server
    const moodleBaseUrl = process.env.MOODLE_URL || 'http://moodle50:8890';
    
    // Try connecting to Moodle
    try {
      const response = await fetch(`${moodleBaseUrl}/lib/ajax/service.php`, {
        method: 'GET',
        cache: 'no-store',
      });
      
      if (response.ok) {
        return NextResponse.json({ 
          status: 'ok', 
          services: {
            moodle: true
          },
          message: 'All services are reachable'
        }, { status: 200 });
      } else {
        return NextResponse.json({ 
          status: 'partial', 
          services: {
            moodle: false
          },
          message: 'Moodle API is not responding correctly'
        }, { status: 207 });
      }
    } catch (error) {
      console.error('Failed to connect to Moodle:', error);
      return NextResponse.json({ 
        status: 'error', 
        services: {
          moodle: false
        },
        message: 'Cannot connect to Moodle',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 207 });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Health check failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 