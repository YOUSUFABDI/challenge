import "@/global.css"
import { GlobalProvider, useGlobalContext } from "@/lib/global-provider"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Stack, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

function InitialLayout() {
  const { isLogged, loading } = useGlobalContext()
  const segments = useSegments()
  const router = useRouter()
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding")
        setIsFirstTime(hasSeen === null)
      } catch (e) {
        setIsFirstTime(false)
      }
    }
    checkOnboardingStatus()
  }, [])

  useEffect(() => {
    if (loading || isFirstTime === null) return

    const inAuthGroup = segments[0] === "(auth)"
    const onOnboarding = segments[0] === "onboarding"

    // FIX: Add the leading slash "/" to the route names
    if (isFirstTime) {
      if (!onOnboarding) router.replace("/onboarding") // Added "/"
      return
    }

    if (isLogged && inAuthGroup) {
      router.replace("/(tabs)") // Ensure leading slash
    } else if (!isLogged && !inAuthGroup && !onOnboarding) {
      router.replace("/(auth)/sign-in") // Ensure leading slash
    }
  }, [isLogged, loading, segments, isFirstTime])

  if (loading || isFirstTime === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090b",
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="create-challenge"
        options={{ presentation: "modal" }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <InitialLayout />
    </GlobalProvider>
  )
}
