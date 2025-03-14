import React from 'react';
import { Image, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
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
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignSelf: 'center',
    marginVertical: 20,
  },
});