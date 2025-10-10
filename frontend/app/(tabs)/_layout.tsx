import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="assistant"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      
      {/* Phase 2: Carbon Footprint Chatbot */}
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      
      {/* Phase 4: Motivation Hub */}
      <Tabs.Screen
        name="motivation"
        options={{
          title: 'Motivation',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />
      
      {/* Profile for onboarding */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      
      {/* Hidden tabs - to be handled by colleague */}
      <Tabs.Screen
        name="habits"
        options={{
          href: null, // Hide - Phase 1: Daily Habit Tracking (colleague's task)
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null, // Hide - Phase 3: Personal Accountability (colleague's task)
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide this tab
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}
