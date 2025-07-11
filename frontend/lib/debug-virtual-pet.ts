// Debug utility for virtual pet API issues
export function debugVirtualPetAuth() {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment");
    return;
  }

  // Check cookies

  // Extract moodleToken from cookies
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  if (cookies.moodleUser) {
    try {
      const userData = JSON.parse(decodeURIComponent(cookies.moodleUser));
    } catch (e) {}
  } else {
    console.log("❌ moodleUser NOT found in cookies");
  }

  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
  } catch (e) {
    console.log("❌ Error accessing localStorage:", e);
  }
}
