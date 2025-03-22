import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

type RootStackParamList = {
    Home: undefined;
    MealDetails: { meal: Meal };
    PetitDejeuner: undefined;
    DéjeunerDîner: undefined;
    Collations: undefined;
    MealList: { category: string }; // Ajoute cette ligne
  };

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

type MealListRouteProp = RouteProp<{ MealList: { category: string } }, 'MealList'>;
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const MealList = () => { 
const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<MealListRouteProp>();
  const { category } = route.params;

  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(' http://192.168.1.166:5000/nutrition');
        const filteredMeals = response.data.filter((meal: Meal) => meal.goal_category === category);
        setMeals(filteredMeals);
      } catch (error) {
        setError('Erreur lors de la récupération des plats');
        console.error('Erreur:', error);
      }
    };

    fetchMeals();
  }, [category]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{category}</Text>
      {meals.map((meal, index) => (
        <View key={index} style={styles.mealContainer}>
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
           <TouchableOpacity onPress={() => navigation.navigate('MealDetails', { meal })}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDetails}>{meal.calories} kcal - {meal.preparation_time} min</Text>
          </TouchableOpacity>
        </View>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}


      {/* Section Footer */}
       <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>@Recette crée par Hchizen https://www.tiktok.com/@hchizen</ThemedText>
        </ThemedView>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  mealContainer: {
    marginBottom: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
  },
  mealImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  mealDetails: {
    fontSize: 14,
    color: 'white',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#1F1F1F', // Couleur de fond du footer
    padding: 26, // Espace intérieur
    alignItems: 'center', // Centrer le texte horizontalement
    justifyContent: 'center', // Centrer le texte verticalement
    marginTop: 4, // Espacement par rapport à la section précédente
    marginBottom: 4, // Espacement par rapport à la section suivante
    borderTopWidth: 1, // Bordure supérieure
    borderTopColor: '#00b80e', // Couleur de la bordure
  },
  footerText: {
    fontSize: 14, // Taille de la police
    color: '#808080', // Couleur du texte
    textAlign: 'center', // Centrer le texte
  },
});

export default MealList;