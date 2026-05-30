import { tabs } from "@/constants/data"
import { colors } from "@/constants/theme"
import { Tabs } from "expo-router"
import { Image, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const TabLayout = () => {
  const insets = useSafeAreaInsets()

  // Custom TabIcon handles both the active/inactive styling and the labels
  const TabIcon = ({
    focused,
    icon,
    title,
  }: {
    focused: boolean
    icon: any
    title: string
  }) => {
    if (focused) {
      return (
        <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center">
          <Image
            source={icon}
            resizeMode="contain"
            className="w-6 h-6"
            style={{ tintColor: colors.primaryForeground }}
          />
        </View>
      )
    }

    return (
      <View className="items-center justify-center gap-1 mt-1">
        <Image
          source={icon}
          resizeMode="contain"
          className="w-6 h-6"
          style={{ tintColor: colors.mutedForeground }}
        />
        <Text
          className="text-[8px] font-medium"
          style={{ color: colors.mutedForeground }}
        >
          {title}
        </Text>
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // We handle the label manually inside TabIcon for better layout control
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 0,
          height: 85 + insets.bottom, // Taller height to accommodate the large active button
          paddingBottom: insets.bottom, // Respect safe area
          paddingTop: 10,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} title={tab.title} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

export default TabLayout
