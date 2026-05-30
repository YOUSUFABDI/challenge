import { signInWithGoogle } from "@/lib/supabase"
import { Ionicons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { styled } from "nativewind"
import React, { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const StyledView = styled(View)
const StyledText = styled(Text)
const StyledTextInput = styled(TextInput)
const StyledPressable = styled(Pressable)

export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          className="px-8"
        >
          <StyledView className="items-center mb-12 mt-10">
            <StyledText className="text-[#a1a1aa] font-bold text-[10px] tracking-[0.2em] uppercase mb-4">
              Challenge
            </StyledText>
            <StyledText className="text-white text-4xl font-extrabold tracking-tight mb-3">
              Welcome Back
            </StyledText>
            <StyledText className="text-[#a1a1aa] text-sm text-center">
              Enter your credentials to continue{"\n"}your journey of
              discipline.
            </StyledText>
          </StyledView>

          <StyledView className="gap-y-5">
            <StyledView>
              <StyledText className="text-[#a1a1aa] font-bold text-[10px] tracking-widest uppercase mb-2 ml-1">
                Email Address
              </StyledText>
              <StyledTextInput
                className="bg-white text-black px-5 h-14 rounded-xl font-semibold"
                placeholder="email@example.com"
                placeholderTextColor="#a1a1aa"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </StyledView>

            <StyledView>
              <StyledView className="flex-row justify-between items-center mb-2 ml-1">
                <StyledText className="text-[#a1a1aa] font-bold text-[10px] tracking-widest uppercase">
                  Password
                </StyledText>
                <Pressable>
                  <StyledText className="text-[#a1a1aa] text-[10px] font-bold uppercase">
                    Forgot?
                  </StyledText>
                </Pressable>
              </StyledView>
              <StyledTextInput
                className="bg-white text-black px-5 h-14 rounded-xl font-semibold"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </StyledView>

            <StyledPressable className="mt-4 active:opacity-80">
              <StyledView className="bg-white h-14 rounded-xl items-center justify-center">
                <StyledText className="text-black font-bold text-[15px]">
                  Sign In
                </StyledText>
              </StyledView>
            </StyledPressable>
          </StyledView>

          {/* DIVIDER - Fixed h-[1px] to h-px */}
          <StyledView className="flex-row items-center my-10">
            <StyledView className="flex-1 h-px bg-[#27272a]" />
            <StyledText className="text-[#a1a1aa] font-bold text-[10px] tracking-widest uppercase px-4">
              Or Continue With
            </StyledText>
            <StyledView className="flex-1 h-px bg-[#27272a]" />
          </StyledView>

          <StyledView className="flex-row justify-between gap-x-4">
            <StyledPressable
              className="flex-1 active:opacity-70"
              onPress={signInWithGoogle}
            >
              <StyledView className="bg-[#121214] border border-[#27272a] h-12 rounded-xl flex-row items-center justify-center">
                <Ionicons name="logo-google" size={18} color="white" />
                <StyledText className="text-white font-semibold text-sm ml-2">
                  Google
                </StyledText>
              </StyledView>
            </StyledPressable>
          </StyledView>

          <StyledView className="flex-row justify-center mt-12 mb-8">
            <StyledText className="text-[#a1a1aa] text-sm">
              New to the collective?{" "}
            </StyledText>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <StyledText className="text-white text-sm font-bold underline">
                  Join Now
                </StyledText>
              </Pressable>
            </Link>
          </StyledView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
