// Moodle API Client
// This file contains functions for interacting with the Moodle API

import { moodleConfig } from "./moodle-auth"
import type { User } from "@/types/auth"
import { UserRole } from "./moodle-auth"

/**
 * Makes a request to the Moodle API
 * @param endpoint The API endpoint to call
 * @param method The HTTP method to use
 * @param params The parameters to send with the request
 * @param token The authentication token (if required)
 * @returns The API response
 */
export async function moodleApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  params: Record<string, any> = {},
  token?: string
): Promise<T> {
  const url = new URL(`${moodleConfig.baseUrl}/webservice/rest/server.php`)
  
  // Common parameters for all Moodle API requests
  url.searchParams.append("moodlewsrestformat", "json")
  url.searchParams.append("wsfunction", endpoint)
  
  if (token) {
    url.searchParams.append("wstoken", token)
  }
  
  try {
    let response: Response
    
    if (method === "GET") {
      // Add params to URL for GET requests
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
      
      response = await fetch(url.toString())
    } else {
      // Use request body for POST requests
      response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
    }
    
    if (!response.ok) {
      throw new Error(`Moodle API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json() as T
  } catch (error) {
    console.error("Moodle API request failed:", error)
    throw error
  }
}

/**
 * Get a token for accessing the Moodle API
 * @param username The username
 * @param password The password
 * @returns The token
 */
export async function getMoodleToken(username: string, password: string): Promise<string> {
  const url = new URL(`${moodleConfig.baseUrl}/login/token.php`)
  url.searchParams.append("username", username)
  url.searchParams.append("password", password)
  url.searchParams.append("service", "moodle_mobile_app")
  
  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Failed to get Moodle token: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(`Moodle token error: ${data.error}`)
    }
    
    return data.token
  } catch (error) {
    console.error("Failed to get Moodle token:", error)
    throw error
  }
}

/**
 * Get user information from Moodle
 * @param token The authentication token
 * @returns The user information
 */
export async function getMoodleUserInfo(token: string): Promise<User> {
  const data = await moodleApiRequest<any>(
    "core_webservice_get_site_info",
    "GET",
    {},
    token
  )
  
  // Map Moodle user data to our User type
  return {
    id: `moodle-${data.userid}`,
    name: data.fullname,
    email: data.username, // Moodle might not return email directly
    role: mapMoodleRoleToUserRole(data.userroleid),
    moodleId: String(data.userid),
    avatarUrl: data.userpictureurl || "/placeholder.svg?height=40&width=40",
  }
}

/**
 * Map Moodle role ID to our UserRole enum
 * @param roleId The Moodle role ID
 * @returns The corresponding UserRole
 */
function mapMoodleRoleToUserRole(roleId: number): UserRole {
  // These mappings should be adjusted based on your Moodle instance's role IDs
  switch (roleId) {
    case 1: // Admin
    case 2: // Manager
      return UserRole.ADMIN
    case 3: // Teacher
    case 4: // Non-editing teacher
      return UserRole.TEACHER
    default:
      return UserRole.STUDENT
  }
}

/**
 * Get OAuth2 authorization URL for Moodle
 * @returns The authorization URL
 */
export function getMoodleOAuthUrl(): string {
  const url = new URL(`${moodleConfig.baseUrl}/admin/oauth2/auth.php`)
  url.searchParams.append("client_id", moodleConfig.clientId)
  url.searchParams.append("response_type", "code")
  url.searchParams.append("redirect_uri", moodleConfig.redirectUri)
  
  return url.toString()
}

/**
 * Exchange OAuth2 code for token
 * @param code The authorization code
 * @returns The access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const url = new URL(`${moodleConfig.baseUrl}/admin/oauth2/token.php`)
  
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: moodleConfig.clientId,
      client_secret: moodleConfig.clientSecret,
      redirect_uri: moodleConfig.redirectUri,
      code,
    }).toString(),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(`OAuth token error: ${data.error}`)
  }
  
  return data.access_token
}