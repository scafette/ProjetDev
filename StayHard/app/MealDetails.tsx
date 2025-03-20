import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Importez useRoute
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: Meal }; // Ajoutez MealDetails avec le type Meal
  Planning: undefined;
  exercice: undefined;
  Qrcode: undefined;
  nutrition: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Définissez le type pour les données du plat
type Meal = {
  id: number;
  name: string;
  ingredients: string;
  preparation_time: number;
  calories: number;
  category: string;
  goal_category: string;
  preparation: string;
  image: string;
};

const MealDetails = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute(); // Utilisez useRoute pour accéder aux paramètres
  const { meal } = route.params as { meal: Meal }; // Récupérez le plat passé en paramètre

  return (
    <View style={styles.container}>
      {/* Image du plat */}
      <Image source={{ uri: meal.image }} style={styles.mealImage} />

      {/* Nom du plat */}
      <Text style={styles.mealName}>{meal.name}</Text>

      {/* Détails du plat (kcal et temps) */}
      <Text style={styles.mealDetails}>
        {meal.calories} kcal - {meal.preparation_time} min
      </Text>

      {/* Ingrédients du plat */}
      <Text style={styles.mealCategory}>
        Ingrédients:
        {'\n'}{meal.ingredients}
      </Text>

      {/* Recette du plat */}
      <Text style={styles.mealCategory}>
        Recette:
        {'\n'}{meal.preparation}
      </Text>
    </View>
  );
};

// Styles pour la page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black', // Fond noir pour correspondre à votre style
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  mealDetails: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  mealCategory: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left', // Alignement à gauche pour la recette
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

export default MealDetails;