import { useGlobalContext } from "@/lib/global-provider"
import { supabase } from "@/lib/supabase" // Adjust path as needed
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { styled } from "nativewind"
import React from "react"
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const StyledView = styled(View)
const StyledText = styled(Text)

const Profile = () => {
  const router = useRouter()
  const { user, refetch } = useGlobalContext()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert("Logout Error", error.message)
    } else {
      // The RootLayout listener will automatically redirect to sign-in
      // but we can manually refetch to clear context immediately
      refetch()
    }
  }

  // Placeholder for when no avatar is provided
  const defaultAvatar =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW64oD2EFgrURPfqcxh14-RbsHxLqnEeGhPw&s"

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <StyledView className="flex-row justify-between items-center py-4">
          <StyledText className="text-white font-bold tracking-widest text-lg uppercase">
            CHALLENGE
          </StyledText>
          <Link href={"/(tabs)/history"}>
            <MaterialIcons name="history" size={28} color="white" />
          </Link>
        </StyledView>

        {/* PROFILE IDENTIFICATION CARD */}
        <StyledView className="bg-[#121214] border border-[#27272a] p-8 rounded-2xl items-center mt-6">
          <Image
            source={{ uri: user?.avatar || defaultAvatar }}
            className="w-24 h-24 rounded-2xl mb-4"
          />
          <StyledText className="text-white text-3xl font-bold tracking-tight text-center">
            {user?.name || "Anonymous User"}
          </StyledText>
          <StyledText className="text-[#a1a1aa] text-xs mt-1">
            {user?.email || "No email available"}
          </StyledText>
        </StyledView>

        {/* ACCOUNT SETTINGS LIST */}
        <StyledView className="mt-8 gap-y-3">
          <SettingsItem icon="settings-outline" label="Account Settings" />
          <SettingsItem icon="notifications-outline" label="Notifications" />
          <SettingsItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
          />
        </StyledView>

        {/* LOGOUT BUTTON */}
        <Pressable
          className="mt-10 mb-20 active:opacity-70"
          onPress={handleLogout}
        >
          <StyledView className="bg-[#1C1C1E] py-5 rounded-2xl flex-row justify-center items-center border border-[#27272a]">
            <Ionicons
              name="exit-outline"
              size={20}
              color="#F87171"
              style={{ marginRight: 8 }}
            />
            <StyledText className="text-[#F87171] font-bold text-sm">
              Logout Account
            </StyledText>
          </StyledView>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

// Sub-components remain the same...
const RankCard = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: any
}) => (
  <StyledView className="bg-[#121214] border border-[#27272a] p-6 rounded-2xl flex-row justify-between items-center">
    <View>
      <StyledText className="text-[#a1a1aa] font-bold text-[10px] tracking-widest uppercase mb-1">
        {label}
      </StyledText>
      <StyledText className="text-white text-2xl font-bold">{value}</StyledText>
    </View>
    <StyledView className="bg-[#2C2C2E] p-3 rounded-xl border border-[#27272a]">
      <Ionicons name={icon} size={24} color="white" />
    </StyledView>
  </StyledView>
)

const SettingsItem = ({ icon, label }: { icon: any; label: string }) => (
  <Pressable className="active:opacity-60">
    <StyledView className="bg-[#121214] border border-[#27272a] p-5 rounded-2xl flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Ionicons
          name={icon}
          size={22}
          color="white"
          style={{ marginRight: 16 }}
        />
        <StyledText className="text-white font-medium text-sm">
          {label}
        </StyledText>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#71717A" />
    </StyledView>
  </Pressable>
)

export default Profile
