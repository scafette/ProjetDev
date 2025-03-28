import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRoute } from '@react-navigation/native';

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

const ExerciceDetails = () => {
  const route = useRoute();
  const { exercise } = route.params as { exercise: Exercise };

  return (
    <ScrollView style={styles.container}>
      {/* Image de l'exercice */}
      <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />

      {/* Titre et catégorie */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{exercise.name}</ThemedText>
        <ThemedText style={styles.category}>{exercise.category}</ThemedText>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Description</ThemedText>
        <ThemedText style={styles.description}>{exercise.description}</ThemedText>
      </View>

      {/* Instructions (vous pouvez ajouter ce champ à votre modèle si nécessaire) */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Instructions</ThemedText>
        <ThemedText style={styles.description}>
          1. Positionnez-vous correctement{"\n"}
          2. Exécutez le mouvement lentement{"\n"}
          3. Contrôlez la descente{"\n"}
          4. Répétez pour le nombre de séries prévues
        </ThemedText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  exerciseImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  category: {
    fontSize: 18,
    color: '#00b80e',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00b80e',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white',
  },
});

export default ExerciceDetails;