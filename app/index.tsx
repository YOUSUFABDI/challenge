import { Redirect } from "expo-router"

export default function Index() {
  // You can later add logic here to check if the user is already logged in
  // or if they have seen the onboarding before.
  const isFirstTime = true

  if (isFirstTime) {
    return <Redirect href="/onboarding" />
  }

  return <Redirect href="/(tabs)" />
}
