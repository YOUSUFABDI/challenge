import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { Alert } from "react-native"

WebBrowser.maybeCompleteAuthSession()

// Explicitly define the storage object if the auto-detection fails
const ExpoStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: ExpoStorage, // Use the explicit object
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
)

export async function signInWithGoogle() {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      // For Expo Go, this usually resolves to exp://192.168.100.13:8081/--/auth/callback
      path: "auth/callback",
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error

    if (data?.url) {
      // This opens the browser and waits for the redirect back to the app
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      )

      if (result.type === "success" && result.url) {
        // Feed the resulting URL back to Supabase to establish the session
        const url = new URL(result.url.replace("#", "?"))
        const access_token = url.searchParams.get("access_token")
        const refresh_token = url.searchParams.get("refresh_token")

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
        }
      }
    }
  } catch (error: any) {
    Alert.alert("Login Error", error.message)
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error
    if (!session) return null

    const user = session.user

    return {
      $id: user.id,
      name:
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email!,
      avatar: user.user_metadata?.avatar_url || "",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
