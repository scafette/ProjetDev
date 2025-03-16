import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, ImageBackground, Image, TextInput } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: { category: string, name: string, kcal: number, time: number, image: any } };
  
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const meals = [
  { category: 'Déjeuner', name: 'Poulet grillé avec quinoa', kcal: 500, time: 30, image: require('../assets/images/nutrition.jpg') },
  { category: 'Déjeuner', name: 'Salade César', kcal: 400, time: 20, image: require('../assets/images/nutrition.jpg') },
  { category: 'Dîner', name: 'Saumon avec légumes vapeur', kcal: 450, time: 25, image: require('../assets/images/nutrition.jpg') },
  // Ajoutez d'autres déjeuners et dîners ici
];

const DejeunerDiner = () => {
      const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Déjeuner & Dîner</Text>
      {meals
        .filter((meal) => meal.category === 'Déjeuner' || meal.category === 'Dîner')
        .map((meal, index) => (
          <View key={index} style={styles.card}>
                <Image source={meal.image} style={styles.image} />
                <TouchableOpacity onPress={() => navigation.navigate('MealDetails', { meal })}>  
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDetails}>{meal.kcal} kcal - {meal.time} min</Text>
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

export default DejeunerDiner