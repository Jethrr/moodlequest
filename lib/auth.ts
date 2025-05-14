// This is a mock authentication service
// In a real application, you would integrate with a backend service

interface User {
  id: string
  name: string
  email: string
}

interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function signIn({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<AuthResult> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo purposes, accept any credentials
      if (email && password) {
        resolve({
          success: true,
          user: {
            id: "1",
            name: "Demo User",
            email,
          },
        })
      } else {
        resolve({
          success: false,
          error: "Invalid credentials",
        })
      }
    }, 1000)
  })
}

export async function register({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<AuthResult> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo purposes, accept any valid input
      if (name && email && password) {
        resolve({
          success: true,
          user: {
            id: "1",
            name,
            email,
          },
        })
      } else {
        resolve({
          success: false,
          error: "Invalid input",
        })
      }
    }, 1000)
  })
}

export async function signOut(): Promise<{ success: boolean }> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 500)
  })
}

export async function getCurrentUser(): Promise<User | null> {
  // Simulate API call to get current user
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo purposes, return null (not logged in)
      resolve(null)
    }, 500)
  })
}
