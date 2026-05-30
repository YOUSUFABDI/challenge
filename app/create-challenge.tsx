import { useGlobalContext } from "@/lib/global-provider"
import { supabase } from "@/lib/supabase"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { styled } from "nativewind"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)

const CreateChallenge = () => {
  const router = useRouter()
  const { user } = useGlobalContext() // Get the current user

  // Form States
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [duration, setDuration] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const durations = [
    { label: "7", sub: "DAYS", value: 7 },
    { label: "30", sub: "DAYS", value: 30 },
    { label: "90", sub: "DAYS", value: 90 },
    { label: "CUSTOM", sub: "CUSTOM", value: 0, icon: "calendar-outline" },
  ]

  // Function to handle saving to Supabase
  const handleStartChallenge = async () => {
    // 1. Validate inputs
    if (!title.trim() || !goal.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please forge a title and define your goal.",
      )
      return
    }

    if (!user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to create a challenge.",
      )
      return
    }

    // 2. Start loading state
    setIsSubmitting(true)

    try {
      // 3. Insert into Supabase
      const { error } = await supabase.from("challenges").insert([
        {
          user_id: user.$id,
          title: title.trim(),
          goal: goal.trim(),
          duration: duration,
          // start_date and created_at are handled automatically by our SQL defaults
        },
      ])

      if (error) throw error

      // 4. Success -> Go to dashboard
      router.replace("/")
    } catch (error: any) {
      Alert.alert("Error Starting Challenge", error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="active:opacity-50 p-1 -ml-1"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </Pressable>
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground font-bold tracking-widest text-lg uppercase ml-1">
                CHALLENGE
              </Text>
            </Pressable>
          </View>
          <Link href={"/(tabs)/history"}>
            <MaterialIcons name="history" size={28} color="white" />
          </Link>
        </View>

        {/* INTRO TEXT */}
        <View className="mt-8 mb-10">
          <Text className="text-muted-foreground font-bold text-[10px] tracking-[3px] uppercase mb-2">
            CURATION ENGINE
          </Text>
          <Text className="text-foreground text-5xl font-bold leading-tight tracking-tighter">
            Forge your path.
          </Text>
          <Text className="text-muted-foreground mt-2 text-sm leading-5">
            Define the parameters of your next evolution. Precision leads to
            mastery.
          </Text>
        </View>

        {/* FORM FIELDS */}
        <View className="gap-y-8">
          {/* TITLE INPUT */}
          <View>
            <Text className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase mb-3">
              CHALLENGE TITLE
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Deep Work Protocol"
              placeholderTextColor="#3F3F46"
              className="bg-card text-foreground p-5 rounded-2xl border border-border font-medium"
            />
          </View>

          {/* GOAL INPUT */}
          <View>
            <Text className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase mb-3">
              THE GOAL
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="What defines success?"
              placeholderTextColor="#3F3F46"
              multiline
              numberOfLines={4}
              className="bg-card text-foreground p-5 rounded-2xl border border-border font-medium h-32 textAlignVertical-top"
            />
          </View>

          {/* DURATION SELECTOR */}
          <View>
            <Text className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase mb-3">
              SELECT DURATION
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-3">
              {durations.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => setDuration(item.value)}
                  className={`w-[48%] p-6 rounded-3xl border items-center justify-center active:opacity-80 ${
                    duration === item.value
                      ? "bg-card border-white"
                      : "bg-card border-border"
                  }`}
                >
                  {item.icon ? (
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="white"
                      className="mb-1"
                    />
                  ) : (
                    <Text className="text-foreground text-2xl font-bold">
                      {item.label}
                    </Text>
                  )}
                  <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                    {item.sub}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* CALENDAR PREVIEW (Static UI preserved) */}
          <View className="bg-card p-6 rounded-3xl border border-border">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase">
                START DATE
              </Text>
              <Text className="text-foreground font-bold text-xs">Today</Text>
            </View>
            {/* Calendar Days Labels */}
            <View className="flex-row justify-between opacity-40 mb-4 px-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <Text
                  key={i}
                  className="text-muted-foreground text-[10px] font-bold w-8 text-center"
                >
                  {d}
                </Text>
              ))}
            </View>
            {/* Calendar Numbers Row 1 */}
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-muted-foreground text-xs w-8 text-center">
                25
              </Text>
              <Text className="text-muted-foreground text-xs w-8 text-center">
                26
              </Text>
              <Text className="text-muted-foreground text-xs w-8 text-center">
                27
              </Text>
              <Text className="text-muted-foreground text-xs w-8 text-center">
                28
              </Text>
              <Text className="text-muted-foreground text-xs w-8 text-center">
                29
              </Text>
              <Text className="text-muted-foreground text-xs w-8 text-center">
                30
              </Text>
              <View className="bg-[#3A3A3C] w-8 h-8 rounded-lg items-center justify-center">
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
            </View>
            {/* Calendar Numbers Row 2 */}
            <View className="flex-row justify-between items-center px-1 mt-4">
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                2
              </Text>
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                3
              </Text>
              <View className="bg-white w-8 h-8 rounded-lg items-center justify-center shadow-md">
                <Text className="text-black font-bold text-xs">4</Text>
              </View>
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                5
              </Text>
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                6
              </Text>
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                7
              </Text>
              <Text className="text-foreground font-bold text-xs w-8 text-center">
                8
              </Text>
            </View>
          </View>
        </View>

        {/* START BUTTON */}
        <Pressable
          className={`bg-foreground py-5 rounded-2xl flex-row items-center justify-center mt-12 mb-20 shadow-lg shadow-white/10 ${isSubmitting ? "opacity-70" : "active:opacity-90"}`}
          onPress={handleStartChallenge}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="black" />
          ) : (
            <>
              <Text className="text-background font-bold text-sm uppercase mr-2 tracking-[2px]">
                Start Challenge
              </Text>
              <Ionicons name="arrow-forward" size={18} color="black" />
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreateChallenge
