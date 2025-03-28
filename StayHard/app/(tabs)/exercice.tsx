import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  Alert,
  TextInput,
  FlatList
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

const IP = "172.20.10.6";

type RootStackParamList = {
  ExerciceList: undefined;
  ExerciceDetails: { exercise: Exercise };
  exoDetails: { exercise: Exercise };
};

type ExerciceNavigationProp = StackNavigationProp<RootStackParamList, 'ExerciceList'>;

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

const ExercicePage = () => {
  const navigation = useNavigation<ExerciceNavigationProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [shuffledExercises, setShuffledExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`http://${IP}:5000/exercices`);
      setExercises(response.data);
      // Mélanger les exercices dès leur réception
      setShuffledExercises(shuffleArray(response.data));
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les exercices.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mélanger un tableau aléatoirement
  const shuffleArray = (array: Exercise[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Filtrer les exercices en fonction de la recherche
  const filteredExercises = shuffledExercises.filter(exercise => {
    return exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('exoDetails', { exercise: item })}
    >
      <Image source={{ uri: item.image }} style={styles.exerciseImage} />
      <View style={styles.exerciseInfo}>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>
        <ThemedText style={styles.exerciseCategory}>{item.category}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header avec image de fond */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Musculation.png')} 
          style={styles.headerImage}
        />
        <ThemedText style={styles.headerTitle}>Exercices</ThemedText>
      </View>

      {/* Barre de recherche */}
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un exercice..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Liste des exercices */}
      {loading ? (
        <ActivityIndicator size="large" color="#00b80e" />
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.exercisesContainer}
          scrollEnabled={false} // Désactive le scroll interne car nous utilisons ScrollView
        />
      )}

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          @Créé par Elmir Elias, Giovanni Mascaro, Ilyes Zekri
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  searchBar: {
    height: 40,
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 15,
    color: 'white',
    borderColor: '#00b80e',
    borderWidth: 1
  },
  exercisesContainer: {
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  exerciseCard: {
    width: '48%', // Pour avoir 2 colonnes avec un petit espace
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00b80e',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 15,
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover'
  },
  exerciseInfo: {
    padding: 10
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#00b80e'
  },
  footer: {
    backgroundColor: '#1F1F1F',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
    marginBottom: 80
  },
  footerText: {
    fontSize: 12,
    color: '#808080'
  }
});

export default ExercicePage;