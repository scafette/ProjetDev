import React from 'react';
import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/adaptive-icon.png')}
          style={[styles.headerImage, { width: '80%', height: 300 }]} // Adjust the width and height as needed
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">StayHard</ThemedText>
        <TouchableOpacity onPress={() => console.log('Edit Profile')}>
          <Ionicons name="settings" size={24} color="black" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Nouveautés Sportives</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ThemedView style={styles.card}>
            <Image source={require('@/assets/images/exercice1.jpeg')} style={styles.cardImage} />
            <ThemedText type="defaultSemiBold">Yoga</ThemedText>
          </ThemedView>
          <ThemedView style={styles.card}>
            <Image source={require('@/assets/images/exercice1.jpeg')} style={styles.cardImage} />
            <ThemedText type="defaultSemiBold">Cardio</ThemedText>
          </ThemedView>
          {/* Ajoutez plus de cartes ici */}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Ton Planning</ThemedText>
        <ThemedView style={styles.scheduleItem}>
          <Ionicons name="calendar" size={20} color="black" />
          <ThemedText style={styles.scheduleText}>Lundi: Course à pied</ThemedText>
        </ThemedView>
        <ThemedView style={styles.scheduleItem}>
          <Ionicons name="calendar" size={20} color="black" />
          <ThemedText style={styles.scheduleText}>Mercredi: Musculation</ThemedText>
        </ThemedView>
        {/* Ajoutez plus d'éléments de planning ici */}
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Tes Exercices</ThemedText>
        <ThemedView style={styles.exerciseItem}>
          <Ionicons name="barbell" size={20} color="black" />
          <ThemedText style={styles.exerciseText}>Squats: 3 séries de 12</ThemedText>
        </ThemedView>
        <ThemedView style={styles.exerciseItem}>
          <Ionicons name="barbell" size={20} color="black" />
          <ThemedText style={styles.exerciseText}>Pompes: 3 séries de 15</ThemedText>
        </ThemedView>
        {/* Ajoutez plus d'éléments d'exercices ici */}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  card: {
    width: 150,
    marginRight: 16,
    alignItems: 'center',
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    marginLeft: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseText: {
    marginLeft: 8,
  },
  headerImage: {
    color: '#808080',
    bottom: -48,
    left: -10,
    position: 'absolute',
  },
});