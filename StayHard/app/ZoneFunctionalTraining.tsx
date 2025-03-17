import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet } from 'react-native';

const FunctionalTraining = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState([
    {
      id: '1',
      name: 'Jumping Jacks',
      image: require('../assets/images/exercice2.jpg'),
      description: 'Cardio, coordination et endurance musculaire'
    },
    {
      id: '2',
      name: 'High Knees',
      image: require('../assets/images/exercice2.jpg'),
      description: 'Cardio, explosivité et renforcement du bas du corps'
    },
    {
      id: '3',
      name: 'Squats au poids du corps',
      image: require('../assets/images/exercice2.jpg'),
      description: 'Debout, pieds écartés à la largeur des épaules, pointes légèrement vers extérieur.'
    },
    // Ajoutez d'autres exercices ici
  ]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un exercice..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  textContainer: {
    flex: 1,
    padding: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default FunctionalTraining;