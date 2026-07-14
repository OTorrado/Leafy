import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, Colors, UIFont } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabIconName = 'leaf.fill' | 'camera.fill' | 'magnifyingglass' | 'alarm.fill';

/** Icon with a soft pill behind it when the tab is selected. */
function TabIcon({
  name,
  color,
  focused,
}: {
  name: TabIconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <IconSymbol size={22} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Brand.green,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          // Soft lift so the bar reads as a surface, not a hard-edged strip.
          shadowColor: '#0B2F1F',
          shadowOpacity: 0.07,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: UIFont.semibold,
          fontSize: 11,
          marginTop: 3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Plants',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: 'Identify',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="camera.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="magnifyingglass" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="alarm.fill" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: '#E4F5EE' },
});