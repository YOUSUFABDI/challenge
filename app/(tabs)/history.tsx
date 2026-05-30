import { useGlobalContext } from "@/lib/global-provider"
import { supabase } from "@/lib/supabase"
import { MaterialIcons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { styled } from "nativewind"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const StyledView = styled(View)
const StyledText = styled(Text)

// Helper function to calculate and format date ranges nicely (e.g., "OCT 14 - NOV 13")
const formatDateRange = (startDateStr: string, durationDays: number) => {
  try {
    const start = new Date(startDateStr)
    const end = new Date(start)
    end.setDate(start.getDate() + durationDays)

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "2-digit",
    }
    const startFormatted = start
      .toLocaleDateString("en-US", options)
      .toUpperCase()
    const endFormatted = end.toLocaleDateString("en-US", options).toUpperCase()

    return `${startFormatted} - ${endFormatted}`
  } catch (e) {
    return "UNKNOWN TIMELINE"
  }
}

const History = () => {
  const router = useRouter()
  const { user } = useGlobalContext()
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("challenges")
          .select("*")
          .eq("user_id", user.$id)
          .order("created_at", { ascending: false }) // Newest challenges first

        if (error) {
          console.error("Error fetching challenges:", error.message)
          return
        }

        if (data) {
          setChallenges(data)
        }
      } catch (error: any) {
        console.error("Error fetching challenges:", error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [user])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <StyledView className="flex-row justify-between items-center py-4">
          <StyledText className="text-foreground font-bold tracking-widest text-lg uppercase">
            CHALLENGE
          </StyledText>
          <Link href={"/(tabs)/history"}>
            <MaterialIcons name="history" size={28} color="white" />
          </Link>
        </StyledView>

        {/* TITLE SECTION */}
        <StyledView className="mt-8 mb-6">
          <StyledText className="text-foreground text-5xl font-bold leading-tight tracking-tighter uppercase">
            History
          </StyledText>
          <StyledText className="text-muted-foreground font-bold text-[10px] tracking-[2px] uppercase mt-2">
            Your past performance perspective
          </StyledText>
        </StyledView>

        {/* LOGS LIST / LOADING STATE */}
        {loading ? (
          <StyledView className="py-20 items-center justify-center">
            <ActivityIndicator color="white" size="large" />
          </StyledView>
        ) : challenges.length === 0 ? (
          <StyledView className="py-20 items-center justify-center border border-dashed border-border rounded-3xl bg-card">
            <StyledText className="text-muted-foreground text-sm font-medium">
              No challenges forged yet.
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="gap-y-4">
            {/* First batch of challenges (up to 2 items) */}
            {challenges.slice(0, 2).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}

            {/* INSIGHT COMPONENT */}
            <StyledView className="my-2 rounded-3xl overflow-hidden h-48 border border-border">
              <ImageBackground
                source={{
                  uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
                }}
                style={{ flex: 1 }}
              >
                <StyledView className="flex-1 p-6 justify-end bg-black/40">
                  <StyledText className="text-muted-foreground font-bold text-[10px] tracking-widest uppercase mb-1">
                    INSIGHT
                  </StyledText>
                  <StyledText className="text-white text-xl font-bold leading-7">
                    Persistence is the quietest form of strength.
                  </StyledText>
                </StyledView>
              </ImageBackground>
            </StyledView>

            {/* Remaining challenges batch */}
            {challenges.slice(2).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </StyledView>
        )}

        {/* LOAD EARLIER BUTTON */}
        {challenges.length > 0 && (
          <Pressable className="mt-8 mb-20">
            <StyledView className="bg-card border border-border py-5 rounded-2xl items-center justify-center active:opacity-70">
              <StyledText className="text-foreground font-bold text-xs uppercase tracking-widest">
                Load Earlier Logs
              </StyledText>
            </StyledView>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const ChallengeCard = ({ challenge }: { challenge: any }) => {
  // Determine text color based on active/completed status
  const statusColor =
    challenge.status === "active" ? "text-success" : "text-muted-foreground"

  return (
    <StyledView className="bg-card border border-border p-6 rounded-3xl flex-row justify-between items-center">
      <View className="flex-1 pr-4">
        <StyledText className="text-muted-foreground font-bold text-[9px] tracking-widest mb-1">
          {formatDateRange(challenge.start_date, challenge.duration)}
        </StyledText>
        <StyledText
          numberOfLines={1}
          className="text-foreground font-bold text-lg uppercase tracking-tight"
        >
          {challenge.title}
        </StyledText>
      </View>
      <View className="items-end">
        <StyledText
          className={`${statusColor} text-2xl font-bold tracking-tighter uppercase`}
        >
          {challenge.duration}D
        </StyledText>
        <StyledText className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">
          {challenge.status}
        </StyledText>
      </View>
    </StyledView>
  )
}

export default History
