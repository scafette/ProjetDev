import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const ÉtirementetMobilité = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les exercices de la catégorie "Étirement et Mobilité"
  const fetchStretchingExercises = async () => {
    try {
      const response = await axios.get('http://192.168.1.166:5000/exercices');
      const stretchingExercises = response.data.filter(exercise => exercise.category === 'Étirement et Mobilité');
      setExercises(stretchingExercises);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les exercices.');
    } finally {
      setLoading(false);
    }
  };

  // Appel de la fonction au chargement de la page
  useEffect(() => {
    fetchStretchingExercises();
  }, []);

  // Filtrage des exercices en fonction de la recherche
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un exercice..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#1F1F1F',
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
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: 'white',
  },
});

export default ÉtirementetMobilité;