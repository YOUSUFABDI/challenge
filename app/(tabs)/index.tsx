import "@/global.css"
import { useGlobalContext } from "@/lib/global-provider"
import { supabase } from "@/lib/supabase"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Link, useFocusEffect } from "expo-router"
import { styled } from "nativewind"
import React, { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const { width } = Dimensions.get("window")

const DashboardScreen = () => {
  const { user } = useGlobalContext()
  const [loading, setLoading] = useState(true)
  const [activeChallenge, setActiveChallenge] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])

  // Fetch metrics every time screen comes into viewport focus
  useFocusEffect(
    useCallback(() => {
      const getDashboardData = async () => {
        if (!user) return
        try {
          setLoading(true)

          // 1. Fetch current active challenge
          const { data: challenge, error: chError } = await supabase
            .from("challenges")
            .select("*")
            .eq("user_id", user.$id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .maybeSingle()

          if (chError) throw chError

          if (challenge) {
            setActiveChallenge(challenge)

            // 2. Fetch logs for this specific challenge
            const { data: challengeLogs, error: logError } = await supabase
              .from("challenge_logs")
              .select("*")
              .eq("challenge_id", challenge.id)

            if (logError) throw logError
            setLogs(challengeLogs || [])
          } else {
            setActiveChallenge(null)
            setLogs([])
          }
        } catch (error: any) {
          console.error("Dashboard error:", error.message)
        } finally {
          setLoading(false)
        }
      }

      getDashboardData()
    }, [user]),
  )

  // Handle marking status for today
  const logTodayStatus = async (status: "completed" | "failed") => {
    if (!activeChallenge) return

    const dayNum = currentDayNumber

    // Out of bounds safety check
    if (dayNum > activeChallenge.duration) {
      Alert.alert(
        "Challenge Finalized",
        "You have completed all tracking parameters for this challenge cycle.",
      )
      return
    }

    try {
      const { error } = await supabase.from("challenge_logs").upsert(
        {
          challenge_id: activeChallenge.id,
          day_number: dayNum,
          status: status,
        },
        { onConflict: "challenge_id,day_number" },
      )

      if (error) throw error

      // Optimistic layout update
      const updatedLogs = [
        ...logs.filter((l) => l.day_number !== dayNum),
        { day_number: dayNum, status },
      ]
      setLogs(updatedLogs)
    } catch (error: any) {
      Alert.alert("Sync Error", error.message)
    }
  }

  // --- ENGINE METRICS CALCULATIONS ---
  const getCalculatedMetrics = () => {
    if (!activeChallenge)
      return {
        currentDayNumber: 1,
        completedDays: [],
        failedDays: [],
        successRate: 0,
        streak: 0,
      }

    // Day counter math based on challenge start date
    const start = new Date(activeChallenge.start_date)
    start.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    const currentDayNumber = Math.max(1, diffDays)

    const completedDays = logs
      .filter((l) => l.status === "completed")
      .map((l) => l.day_number)
    const failedDays = logs
      .filter((l) => l.status === "failed")
      .map((l) => l.day_number)

    // Calculate Success Rate
    const totalLogged = completedDays.length + failedDays.length
    const successRate =
      totalLogged > 0
        ? Math.round((completedDays.length / totalLogged) * 100)
        : 0

    // Calculate Current Streak backwards from today/yesterday
    let streak = 0
    let checkDay =
      logs.find((l) => l.day_number === currentDayNumber)?.status ===
      "completed"
        ? currentDayNumber
        : currentDayNumber - 1

    while (checkDay > 0) {
      const logForDay = logs.find((l) => l.day_number === checkDay)
      if (logForDay && logForDay.status === "completed") {
        streak++
        checkDay--
      } else if (logForDay && logForDay.status === "failed") {
        break // Break streak loop on failure log
      } else {
        // Unlogged day prior to yesterday breaks current streak tracking
        if (checkDay < currentDayNumber - 1) break
        checkDay--
      }
    }

    return { currentDayNumber, completedDays, failedDays, successRate, streak }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    )
  }

  // Fallback view state if no challenge parameters have been configured yet
  if (!activeChallenge) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-between px-6 py-4">
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-foreground font-bold tracking-widest text-lg">
            CHALLENGE
          </Text>
          <Link href={"/(tabs)/history"}>
            <MaterialIcons name="history" size={28} color="white" />
          </Link>
        </View>
        <View className="items-center justify-center flex-1">
          <Ionicons
            name="shield-outline"
            size={64}
            color="#3F3F46"
            className="mb-4"
          />
          <Text className="text-foreground text-2xl font-bold tracking-tight text-center">
            No Active Protocol
          </Text>
          <Text className="text-muted-foreground text-sm text-center mt-2 px-6">
            Initiate a structured challenge timeline to track performance
            metrics and construct continuous patterns.
          </Text>
        </View>
        <Link href="/create-challenge" asChild>
          <Pressable className="bg-foreground py-5 rounded-xl flex-row items-center justify-center mb-10">
            <Ionicons name="add-circle-outline" size={24} color="black" />
            <Text className="text-background font-bold text-sm uppercase ml-2 tracking-widest">
              Forge First Protocol
            </Text>
          </Pressable>
        </Link>
      </SafeAreaView>
    )
  }

  const { currentDayNumber, completedDays, failedDays, successRate, streak } =
    getCalculatedMetrics()
  const totalDaysArray = Array.from(
    { length: activeChallenge.duration },
    (_, i) => i + 1,
  )
  const progressPercent = Math.min(
    100,
    Math.round(((currentDayNumber - 1) / activeChallenge.duration) * 100),
  )
  const todayLoggedStatus = logs.find(
    (l) => l.day_number === currentDayNumber,
  )?.status

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* TOP NAVIGATION BAR */}
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-foreground font-bold tracking-widest text-lg">
            CHALLENGE
          </Text>
          <Link href={"/(tabs)/history"}>
            <MaterialIcons name="history" size={28} color="white" />
          </Link>
        </View>

        {/* HERO TITLE SECTION */}
        <View className="mt-8 mb-2">
          <Text className="text-foreground text-5xl font-bold leading-none tracking-tighter uppercase">
            {activeChallenge.title}
          </Text>

          <View className="flex-row items-center mt-6">
            <Text className="text-muted-foreground font-bold text-xs tracking-widest mr-4">
              {Math.min(currentDayNumber, activeChallenge.duration)} /{" "}
              {activeChallenge.duration} DAYS
            </Text>
            {/* PROGRESS BAR */}
            <View className="flex-1 h-[2px] bg-muted relative">
              <View
                className="absolute left-0 top-0 h-full bg-foreground"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>
        </View>

        {/* TODAY ACTION MODULE */}
        <View className="bg-card border border-border rounded-3xl p-6 mt-8">
          <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mb-2">
            DAY {currentDayNumber} SELECTION
          </Text>
          <Text className="text-foreground text-lg font-bold mb-4">
            {todayLoggedStatus
              ? `Marked as ${todayLoggedStatus.toUpperCase()} today.`
              : "Verify current calendar day baseline:"}
          </Text>
          <View className="flex-row gap-x-3">
            <Pressable
              onPress={() => logTodayStatus("completed")}
              className={`flex-1 py-4 rounded-xl items-center justify-center flex-row border ${todayLoggedStatus === "completed" ? "bg-success border-success" : "bg-transparent border-border active:opacity-80"}`}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={todayLoggedStatus === "completed" ? "black" : "#5EBC67"}
                className="mr-2"
              />
              <Text
                className={`font-bold text-xs uppercase tracking-wider ${todayLoggedStatus === "completed" ? "text-black" : "text-foreground"}`}
              >
                Complete
              </Text>
            </Pressable>
            <Pressable
              onPress={() => logTodayStatus("failed")}
              className={`flex-1 py-4 rounded-xl items-center justify-center flex-row border ${todayLoggedStatus === "failed" ? "bg-destructive border-destructive" : "bg-transparent border-border active:opacity-80"}`}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={todayLoggedStatus === "failed" ? "white" : "#E55E5E"}
                className="mr-2"
              />
              <Text
                className={`font-bold text-xs uppercase tracking-wider ${todayLoggedStatus === "failed" ? "text-white" : "text-foreground"}`}
              >
                Failed
              </Text>
            </Pressable>
          </View>
        </View>

        {/* PROGRESS GRID CARD */}
        <View className="bg-card rounded-3xl p-6 mt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-foreground font-bold text-lg">
              Progress Grid
            </Text>
            <View className="bg-muted px-3 py-1 rounded-full">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase">
                Active Protocol
              </Text>
            </View>
          </View>

          {/* GRID RENDER */}
          <View className="flex-row flex-wrap justify-start gap-x-[7px]">
            {totalDaysArray.map((day) => {
              const isCompleted = completedDays.includes(day)
              const isFailed = failedDays.includes(day)
              const isToday = day === currentDayNumber

              return (
                <View
                  key={day}
                  className="mb-2 items-center justify-center rounded-lg"
                  style={{
                    width: (width - 112) / 7.5,
                    height: (width - 112) / 7.5,
                    backgroundColor: isCompleted
                      ? "#5EBC67"
                      : isFailed
                        ? "#E55E5E"
                        : "#2C2C2E",
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? "white" : "transparent",
                  }}
                >
                  <Text
                    className={`font-bold text-[10px] ${isToday ? "text-white" : "text-muted-foreground opacity-40"}`}
                  >
                    {day}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* STATS SECTION */}
        <View className="flex-row gap-x-4 mt-6">
          {/* CURRENT STREAK */}
          <View className="flex-1 bg-card rounded-3xl p-6 h-36 justify-center">
            <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              Current Streak
            </Text>
            <View className="flex-row items-baseline gap-x-2">
              <Text className="text-foreground text-4xl font-bold">
                {streak}
              </Text>
              <Text className="text-foreground text-2xl font-bold">DAYS</Text>
              <MaterialIcons
                name="local-fire-department"
                size={20}
                color={streak > 0 ? "#5EBC67" : "white"}
              />
            </View>
          </View>

          {/* SUCCESS RATE */}
          <View className="flex-1 bg-card rounded-3xl p-6 h-36 justify-center">
            <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              Success Rate
            </Text>
            <View className="flex-row items-center gap-x-2">
              <Text className="text-foreground text-4xl font-bold">
                {successRate}%
              </Text>
              <Ionicons name="stats-chart" size={20} color="white" />
            </View>
          </View>
        </View>

        {/* CREATE BUTTON */}
        <Link href="/create-challenge" asChild>
          <Pressable className="bg-foreground py-5 rounded-xl flex-row items-center justify-center mt-8 mb-20">
            <Ionicons name="add-circle-outline" size={24} color="black" />
            <Text className="text-background font-bold text-sm uppercase ml-2 tracking-widest">
              Create New Challenge
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  )
}

export default DashboardScreen
