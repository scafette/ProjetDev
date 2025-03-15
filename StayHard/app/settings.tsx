import { StyleSheet, SectionList, Switch, Text, View, Platform, Image } from 'react-native';
import React, { useState } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const settingsData = [
    {
      title: 'Affichage',
      data: [
        { key: 'darkMode', label: 'Mode sombre', type: 'switch' },
      ],
    },
    {
      title: 'Notifications',
      data: [
        { key: 'pushNotifications', label: 'Notifications push', type: 'switch' },
        { key: 'silenceNotifications', label: 'Ne pas déranger', type: 'switch' },
      ],
    },
    {
      title: 'Confidentialité',
      data: [
        { key: 'locationAccess', label: 'Accès à la localisation', type: 'switch' },
        { key: 'camAccess', label: 'Accès à la caméra', type: 'switch' },
        { key: 'micAccess', label: 'Accès au microphone', type: 'switch' },
      ],
    },
  ];

  export default function SettingsScreen() {
    const [settings, setSettings] = useState({
      darkMode: false,
      pushNotifications: true,
      locationAccess: false,
    });
  
    const toggleSwitch = (key: string) => {
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/settingsgear.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Paramètres</ThemedText>
      </ThemedView>

      {/* Boîte contenant les paramètres */}
      <ThemedView style={styles.titleContainer}>
        <SectionList
          sections={settingsData}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>{item.label}</Text>
              {item.type === 'switch' && (
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => toggleSwitch(item.key)}
                />
              )}
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -60,
        left: -10,
        position: 'absolute'
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    sectionHeader: {
        color: "#fff",
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    settingText: {
      fontSize: 16,
      color: "#fff",
    },
});
