import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

const IP = "172.20.10.6";

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: Meal };
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

const PetitDejeuner = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(`http://${IP}:5000/nutrition`);
        const petitDejeunerMeals = response.data.filter((meal: Meal) => 
          meal.category === 'Petit déjeuner'
        );
        setMeals(petitDejeunerMeals);
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Petit-déjeuner</Text>
      {meals.map((meal, index) => (
        <View key={index} style={styles.card}>
          <Image source={{ uri: meal.image }} style={styles.image} />
          <TouchableOpacity onPress={() => navigation.navigate('MealDetails', { meal })}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDetails}>
              {meal.calories} kcal - {meal.preparation_time} min
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  mealDetails: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
});

export default PetitDejeuner;