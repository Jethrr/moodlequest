import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const MOODLE_URL = process.env.MOODLE_URL || 'https://moodle50:8890';

// Disable SSL verification for development environments
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, service = "modquest" } = body

    console.log("Sign-in attempt for user:", username);

    // STEP 1: Get Moodle token via direct call
    try {
      // Construct the token URL
      const tokenUrl = `${MOODLE_URL}/login/token.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&service=${service}`;
      console.log("Fetching token from:", tokenUrl);
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!tokenResponse.ok) {
        console.error("Token fetch failed:", tokenResponse.status, tokenResponse.statusText);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to get Moodle token: ${tokenResponse.statusText}` 
        }, { status: 401 });
      }
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) {
        console.error("No token in response:", tokenData);
        return NextResponse.json({ 
          success: false, 
          error: tokenData.error || "Failed to authenticate with Moodle" 
        }, { status: 401 });
      }
      
      const token = tokenData.token;
      console.log("Successfully obtained Moodle token");
      
      // STEP 2: Get user data using the token
      try {
        // Construct user info URL
        const userInfoUrl = `${MOODLE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_user_get_users_by_field&moodlewsrestformat=json&field=username&values[0]=${encodeURIComponent(username)}`;
        console.log("Fetching user info from:", userInfoUrl);
        
        const userInfoResponse = await fetch(userInfoUrl);
        
        if (!userInfoResponse.ok) {
          console.error("User info fetch failed:", userInfoResponse.status, userInfoResponse.statusText);
          return NextResponse.json({ 
            success: false, 
            error: `Failed to get user information: ${userInfoResponse.statusText}` 
          }, { status: 400 });
        }
        
        const userData = await userInfoResponse.json();
        
        if (!Array.isArray(userData) || userData.length === 0) {
          console.error("No user data returned:", userData);
          return NextResponse.json({ 
            success: false, 
            error: "No user information found" 
          }, { status: 404 });
        }
        
        console.log("Successfully retrieved user information");
        const moodleUser = userData[0];
        
        // Skip backend storage if it's not available
        try {
          // Store the user data in our backend (if available)
          const storeUserResponse = await fetch(`${API_BASE_URL}/auth/moodle/store-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              moodleId: moodleUser.id,
              username: moodleUser.username,
              email: moodleUser.email || `${moodleUser.username}@example.com`,
              firstName: moodleUser.firstname || '',
              lastName: moodleUser.lastname || '',
              token: token,
              privateToken: tokenData.privatetoken || ''
            }),
          });
          
          if (!storeUserResponse.ok) {
            console.error(`Error storing user: ${storeUserResponse.status}`);
            // Continue anyway - we still have token and user info for this session
          } else {
            console.log("Successfully stored user data in backend");
          }
        } catch (storageError) {
          console.error("Error connecting to backend for user storage:", storageError);
          // Continue with login process even if backend storage fails
        }
        
        // Determine user role based on Moodle capabilities or roles array
        let role = "student";
        if (moodleUser.roles && Array.isArray(moodleUser.roles)) {
          const isTeacher = moodleUser.roles.some((r: { shortname: string }) => 
            r.shortname === "editingteacher" || 
            r.shortname === "manager" || 
            r.shortname === "coursecreator"
          );
          const isAdmin = moodleUser.roles.some((r: { shortname: string }) => 
            r.shortname === "admin" || 
            r.shortname === "manager"
          );
          
          if (isAdmin) role = "admin";
          else if (isTeacher) role = "teacher";
        }
        
        // Construct user object with all necessary data
        const finalUserData = {
          id: moodleUser.id,
          username: moodleUser.username,
          name: `${moodleUser.firstname || ''} ${moodleUser.lastname || ''}`.trim() || moodleUser.username,
          email: moodleUser.email || `${moodleUser.username}@example.com`,
          role: role,
          moodleId: moodleUser.id,
          token: token,
          privateToken: tokenData.privatetoken || '',
          avatarUrl: moodleUser.profileimageurl || "",
        };
        
        console.log("Login successful for user:", username);
        return NextResponse.json({
          success: true,
          token: token,
          privateToken: tokenData.privatetoken || '',
          user: finalUserData
        });
      } catch (userInfoError) {
        console.error("Error fetching user info:", userInfoError);
        return NextResponse.json({ 
          success: false, 
          error: userInfoError instanceof Error ? userInfoError.message : "Failed to retrieve user information" 
        }, { status: 500 });
      }
    } catch (tokenError) {
      console.error("Token fetch error:", tokenError);
      return NextResponse.json({ 
        success: false, 
        error: tokenError instanceof Error ? tokenError.message : "Failed to authenticate with Moodle" 
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Authentication failed. Please check your credentials or try again later." 
    }, { status: 500 });
  }
} 