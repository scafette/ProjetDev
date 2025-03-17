import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ExerciseScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  const exercises = [
    {
      id: '1',
      name: 'Jumping Jacks',
      image: require('../../assets/images/exercice2.jpg'),
      description: 'Cardio, coordination et endurance musculaire',
      type: 'Cardio',
      muscle: 'Full Body',
      difficulty: 'Débutant',
      isFavorite: false,
    },
    {
      id: '2',
      name: 'High Knees',
      image: require('../../assets/images/exercice2.jpg'),
      description: 'Cardio, explosivité et renforcement du bas du corps',
      type: 'Cardio',
      muscle: 'Jambes',
      difficulty: 'Intermédiaire',
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Squats au poids du corps',
      image: require('../../assets/images/exercice2.jpg'),
      description: 'Debout, pieds écartés à la largeur des épaules, pointes légèrement vers extérieur.',
      type: 'Musculation',
      muscle: 'Jambes',
      difficulty: 'Débutant',
      isFavorite: false,
    },
    // Ajoutez d'autres exercices ici
  ];

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFavoritesOnly(false);
    setSelectedType('');
    setSelectedMuscle('');
    setSelectedDifficulty('');
    setShowDifficultySelector(false);
  };

  // Filtrer les exercices en fonction des critères
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !favoritesOnly || exercise.isFavorite;
    const matchesType = !selectedType || exercise.type === selectedType;
    const matchesMuscle = !selectedMuscle || exercise.muscle === selectedMuscle;
    const matchesDifficulty = !selectedDifficulty || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesFavorites && matchesType && matchesMuscle && matchesDifficulty;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercices</Text>

      {/* Barre de recherche */}
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un exercice..."
        placeholderTextColor="white"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, favoritesOnly && styles.activeFilter]}
          onPress={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Text style={styles.filterText}>Favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'Cardio' && styles.activeFilter]}
          onPress={() => setSelectedType(selectedType === 'Cardio' ? '' : 'Cardio')}
        >
          <Text style={styles.filterText}>Cardio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, selectedMuscle === 'Jambes' && styles.activeFilter]}
          onPress={() => setSelectedMuscle(selectedMuscle === 'Jambes' ? '' : 'Jambes')}
        >
          <Text style={styles.filterText}>Jambes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDifficultySelector(!showDifficultySelector)}
        >
          <Text style={styles.filterText}>Difficulté</Text>
        </TouchableOpacity>
        {showDifficultySelector && (
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={[styles.selectorOption, selectedDifficulty === 'Débutant' && styles.activeFilter]}
              onPress={() => {
                setSelectedDifficulty('Débutant');
                setShowDifficultySelector(false);
              }}
            >
              <Text style={styles.filterText}>Débutant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectorOption, selectedDifficulty === 'Intermédiaire' && styles.activeFilter]}
              onPress={() => {
                setSelectedDifficulty('Intermédiaire');
                setShowDifficultySelector(false);
              }}
            >
              <Text style={styles.filterText}>Intermédiaire</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectorOption, selectedDifficulty === 'Difficile' && styles.activeFilter]}
              onPress={() => {
                setSelectedDifficulty('Difficile');
                setShowDifficultySelector(false);
              }}
            >
              <Text style={styles.filterText}>Difficile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton de réinitialisation */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <Text style={styles.filterText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des exercices filtrés */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.details}>
                Type: {item.type} | Muscle: {item.muscle} | Difficulté: {item.difficulty}
              </Text>
              {item.isFavorite && <Text style={styles.favorite}>⭐ Favori</Text>}
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
    backgroundColor: 'black',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 25,
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#00b80e',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: 'black',
    color: 'white',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    alignItems: 'center', // Pour aligner le bouton de réinitialisation
  },
  filterButton: {
    padding: 8,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#00b80e',
  },
  activeFilter: {
    backgroundColor: '#00b80e',
  },
  resetButton: {
    padding: 8,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#ff4444', // Couleur rouge pour le bouton de réinitialisation
  },
  filterText: {
    color: 'white',
  },
  selectorContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 8,
    zIndex: 1,
  },
  selectorOption: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#2D2D2D',
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
    height: 120,
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
  details: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  favorite: {
    fontSize: 12,
    color: '#ffa500',
    marginTop: 4,
  },
});

export default ExerciseScreen;