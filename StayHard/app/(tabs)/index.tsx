import React from 'react';
import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Planning: undefined; // Ajoutez d'autres écrans ici
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation

  return (
    <ScrollView style={styles.container}>
      {/* Section Titre */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{"Bonjour\n Bassem !"}</ThemedText>
      </ThemedView>

      {/* Carte Planning */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Planning')} // Naviguer vers l'écran Planning
      >
        <ThemedView style={styles.cardContent}>
          <Ionicons name="calendar-outline" size={24} color="#00b80e" />
          <ThemedText style={styles.cardText}>
            <ThemedText>Planning{"\n"}</ThemedText>
            <ThemedText style={styles.smallText}>Accéder au planning</ThemedText>
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {/* Section MON CLUB avec image en arrière-plan */}
      <ThemedView style={styles.sectionContainer}>
        <ImageBackground
          source={require('../../assets/images/monclub.png')}
          style={styles.clubImageBackground}
          imageStyle={styles.clubImageStyle}
        >
          <ThemedText style={styles.clubOverlayText}>
            <ThemedText style={styles.clubSubtitle}>MON CLUB</ThemedText>
            <ThemedText style={styles.clubTitle}>LA SALLE DE SPORTS CLUB</ThemedText>
          </ThemedText>
        </ImageBackground>
      </ThemedView>

      {/* Section Nouveautés Sportives */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Nouveautés Sportives</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ThemedView style={styles.sportCard}>
            <Image source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage} />
            <ThemedText type="defaultSemiBold">Yoga</ThemedText>
          </ThemedView>
          <ThemedView style={styles.sportCard}>
            <Image source={require('../../assets/images/exercice2.jpg')} style={styles.sportCardImage} />
            <ThemedText type="defaultSemiBold">Cardio</ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      {/* Section Tes Exercices */}
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
    backgroundColor: 'black',
  },
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
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: 12,
    color: '#808080',
    marginTop: 4,
  },
  clubImageBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  clubImageStyle: {
    borderRadius: 10,
    top: -10,
  },
  clubOverlayText: {
    textAlign: 'center',
  },
  clubSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clubTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  sportCard: {
    width: 150,
    marginRight: 16,
    alignItems: 'center',
  },
  sportCardImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseText: {
    marginLeft: 8,
    fontSize: 16,
  },
});