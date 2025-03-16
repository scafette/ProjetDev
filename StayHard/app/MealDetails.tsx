import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Planning: undefined; // Ajoutez d'autres écrans ici
  exercice: undefined;
  Qrcode: undefined;
  nutrition: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Définissez le type pour les données du plat
type Meal = {
  category: string;
  name: string;
  kcal: number;
  time: number;
  image: any; // ou `number` si vous utilisez require() pour les images locales
};

// Données du plat (vous pouvez les remplacer par les données réelles plus tard)
const meal: Meal = {
  category: 'Petit-déjeuner',
  name: 'Omelette aux légumes',
  kcal: 300,
  time: 15,
  image: require('../assets/images/nutrition.jpg'), // Remplacez par le chemin de votre image
};

const MealDetails = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation
  return (
    <View style={styles.container}>
      {/* Image du plat */}
      <Image source={meal.image} style={styles.mealImage} />

      {/* Nom du plat */}
      <Text style={styles.mealName}>{meal.name}</Text>

      {/* Détails du plat (kcal et temps) */}
      <Text style={styles.mealDetails}>
        {meal.kcal} kcal - {meal.time} min
      </Text>

      {/* Recette du plat */}
      <Text style={styles.mealCategory}>
        Recette: 
        {'\n'}1. Coupez les légumes en petits morceaux.
        {'\n'}2. Battez les œufs dans un bol.
        {'\n'}3. Faites chauffer une poêle avec un peu d'huile.
        {'\n'}4. Ajoutez les légumes et faites-les revenir pendant 5 minutes.
        {'\n'}5. Versez les œufs battus sur les légumes.
        {'\n'}6. Faites cuire jusqu'à ce que les œufs soient bien cuits.
        {'\n'}7. Servez chaud.
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
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MealDetails;