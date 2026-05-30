import { ONBOARDING_DATA } from "@/constants/data"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { styled } from "nativewind"
import React, { useRef, useState } from "react"
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context"

const SafeAreaView = styled(RNSafeAreaView)
const StyledView = styled(View)
const StyledText = styled(Text)

const Onboarding = () => {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true")
    router.replace("/(auth)/sign-in")
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      completeOnboarding()
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <StyledView
            style={{ width }}
            className="flex-1 items-center justify-center px-8"
          >
            <StyledView className="w-full aspect-square rounded-2xl overflow-hidden mb-12 border border-[#27272a]">
              <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </StyledView>
            <StyledView className="items-center mb-8">
              <StyledText className="text-white text-4xl font-bold tracking-tighter uppercase mb-4 text-center">
                {item.title}
              </StyledText>
              <StyledText className="text-[#a1a1aa] text-center text-lg leading-6 px-4">
                {item.description}
              </StyledText>
            </StyledView>
          </StyledView>
        )}
      />

      <StyledView className="px-8 pb-12">
        <StyledView className="flex-row gap-x-2 mb-12 justify-center">
          {ONBOARDING_DATA.map((_, index) => (
            <StyledView
              key={index}
              className={`h-1.5 rounded-full ${index === currentIndex ? "w-8 bg-white" : "w-1.5 bg-zinc-800"}`}
            />
          ))}
        </StyledView>

        <StyledView className="gap-y-6">
          <Pressable onPress={handleNext} className="active:opacity-90">
            <StyledView className="bg-white py-5 rounded-3xl items-center justify-center">
              <StyledText className="text-black font-bold text-base uppercase tracking-widest">
                {currentIndex === ONBOARDING_DATA.length - 1
                  ? "Get Started"
                  : "Next"}
              </StyledText>
            </StyledView>
          </Pressable>

          <Pressable onPress={completeOnboarding} className="active:opacity-60">
            <StyledText className="text-[#a1a1aa] text-center font-bold text-sm uppercase tracking-widest">
              Skip Intro
            </StyledText>
          </Pressable>
        </StyledView>
      </StyledView>
    </SafeAreaView>
  )
}

export default Onboarding
