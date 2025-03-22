import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TextInput, StyleSheet, ScrollView, Image } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Importez Picker depuis @react-native-picker/picker
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from "axios";

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

const ExercicePage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchExercises = async () => {
    try {
      const response = await axios.get("http://172.20.10.6:5000/exercices");
      setExercises(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les exercices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const groupByCategory = () => {
    const categories: { [key: string]: Exercise[] } = {};
    exercises.forEach((exercise) => {
      if (!categories[exercise.category]) {
        categories[exercise.category] = [];
      }
      categories[exercise.category].push(exercise);
    });
    return categories;
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearchQuery = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? exercise.category === selectedCategory : true;
    return matchesSearchQuery && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map((exercise) => exercise.category)));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.goalText}>Exercices</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un exercice..."
        placeholderTextColor="#999" // Ajout pour améliorer la visibilité du placeholder
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          console.log("Search Query:", text); // Pour déboguer
        }}
      />

      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Toutes les catégories" value="" />
        {categories.map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        Object.entries(groupByCategory()).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <FlatList
              data={items.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (selectedCategory ? item.category === selectedCategory : true)
              )}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <Text style={styles.exerciseTitle}>{item.name}</Text>
                  <Text style={styles.exerciseInfo}>{item.description}</Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))
      )}

      {/* Section Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>@Créé par Elmir Elias, Giovanni Mascaro, Ilyes Zekri</ThemedText>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    padding: 30,
    alignItems: "center",
  },
  goalText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 30,
    marginBottom: 10,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
    color: 'white',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
    marginTop: -50,
    marginBottom: 150,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    margin: 10,
  },
  card: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    width: 150,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 100,
    marginTop: -10,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  exerciseInfo: {
    fontSize: 12,
    color: "#bbb",
  },
  footer: {
    backgroundColor: '#1F1F1F',
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 84,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
  },
  footerText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});

export default ExercicePage;