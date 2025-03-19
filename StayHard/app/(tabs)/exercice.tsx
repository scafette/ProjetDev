import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { ScrollView, StyleSheet } from "react-native";
import { Image } from "react-native";


interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string; // Add this line
}

const ExercicePage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    try {
      const response = await axios.get("http://192.168.1.166:5000/exercices");
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

 // Fonction pour grouper les exercices par catégorie
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

return (
  <ScrollView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.goalText}>Exercices</Text>
    </View>

    {loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : (
      Object.entries(groupByCategory()).map(([category, items]) => (
        <View key={category}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={items}
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
  backgroundColor: "#222",
  alignItems: "center",
},
goalText: {
  fontSize: 18,
  color: "#fff",
},
calorieText: {
  fontSize: 28,
  fontWeight: "bold",
  color: "#ffcc00",
},
programBox: {
  backgroundColor: "#333",
  padding: 10,
  borderRadius: 10,
  marginTop: 10,
},
programText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},
programSubtext: {
  color: "#bbb",
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
  width: 130,
  height: 100,
  borderRadius: 10,
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
});

export default ExercicePage;
