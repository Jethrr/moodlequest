# Badge System Troubleshooting Guide

## Problem: "Request timeout" error when loading badges

This error indicates that the frontend cannot reach the backend badges endpoint within the timeout period (15 seconds).

### Quick Fix Steps:

1. **Check if backend server is running**

   ```bash
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
   ```

2. **Test the badges endpoint directly**

   ```bash
   python test_badge_endpoint.py
   ```

3. **Seed badges if database is empty**
   ```bash
   curl -X POST http://localhost:8002/api/badges/seed
   ```

### Detailed Troubleshooting:

#### Backend Server Issues:

- Ensure the backend is running on port 8002
- Check backend logs for database connection errors
- Verify database is accessible and running

#### Database Issues:

- Check PostgreSQL/database server is running
- Verify database credentials in backend config
- Check if badge tables exist

#### Network Issues:

- Verify frontend is configured to use correct API URL
- Check for firewall/port blocking issues
- Try accessing http://localhost:8002/api/badges directly in browser

#### Badge Data Issues:

- If endpoint works but returns empty array, run badge seeder
- Check if badge seeder completed successfully
- Verify badge criteria format is correct

### Configuration Check:

1. **Frontend API URL** (should be in `.env` or hardcoded):

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8002/api
   ```

2. **Backend Database Connection**:
   - Check backend database credentials
   - Ensure database migrations are applied

### Expected Behavior:

When working correctly:

- Badges endpoint should respond within 2-3 seconds
- Should return array of badge objects with proper structure
- Frontend should display badges in the student quest page

### Recent Improvements:

The badge system now includes:

- ✅ Increased timeout (15 seconds) for badge requests
- ✅ Graceful error handling and fallback states
- ✅ Retry mechanisms with exponential backoff
- ✅ User-friendly error messages
- ✅ Empty state with seed button
- ✅ Real-time badge updates via SSE notifications

### Testing the Fix:

1. Start backend server
2. Run test script: `python test_badge_endpoint.py`
3. Access frontend student quest page
4. Check browser console for any remaining errors
5. Test badge refresh after quest completion

If issues persist, check:

- Backend server logs
- Browser developer tools network tab
- Database connection status
