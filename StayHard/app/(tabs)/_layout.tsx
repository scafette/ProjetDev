import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
        // Use a transparent background on iOS to show the blur effect
        position: 'absolute',
        },
        default: {},
      }),
      }}>
      <Tabs.Screen
      name="index"
      options={{
        title: 'Accueil',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
      }}
      />
      <Tabs.Screen
      name="exercice"
      options={{
        title: 'Exercices',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="dumbbell" size={24} color={color} />,
      }}
      />
      <Tabs.Screen
      name="Planning"
      options={{
        title: 'Planning',
        tabBarIcon: ({ color }) => <Ionicons size={28} name="calendar-outline" color={color} />,
      }}
      
      />
      <Tabs.Screen
      name="clubs"
      options={{
        title: 'Clubs',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="animation-outline" color={color} />,
      }}
      
      />
        <Tabs.Screen
      name="account"
      options={{
        title: 'Profil',
        tabBarIcon: ({ color }) => <AntDesign size={28} name="user" color={color} />,
      }}
      />
    </Tabs>
  );
}
