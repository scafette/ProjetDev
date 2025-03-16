import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, ImageBackground, Image, TextInput } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: { category: string, name: string, kcal: number, time: number, image: any } };
  PetitDejeuner: undefined;
  DéjeunerDîner: undefined;
  Collations: undefined;
  
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const NutritionPage = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [userGoal, setUserGoal] = useState('Prise de masse');
  const [dailyKcal, setDailyKcal] = useState(2500);
  const [dailyKcalInput, setDailyKcalInput] = useState('');

  const meals = [
    { category: 'Petit-déjeuner', name: 'Omelette aux légumes', kcal: 300, time: 15, image: require('../assets/images/nutrition.jpg') },
    { category: 'Petit-déjeuner', name: 'Smoothie bowl', kcal: 250, time: 10, image: require('../assets/images/nutrition.jpg') },
    { category: 'Petit-déjeuner', name: 'Smoothie bowl', kcal: 250, time: 10, image: require('../assets/images/nutrition.jpg') },
    { category: 'Petit-déjeuner', name: 'Smoothie bowl', kcal: 250, time: 10, image: require('../assets/images/nutrition.jpg') },
    { category: 'Déjeuner', name: 'Poulet grillé avec quinoa', kcal: 500, time: 30, image: require('../assets/images/nutrition.jpg') },
    { category: 'Déjeuner', name: 'Salade César', kcal: 400, time: 20, image: require('../assets/images/nutrition.jpg') },
    { category: 'Dîner', name: 'Saumon avec légumes vapeur', kcal: 450, time: 25, image: require('../assets/images/nutrition.jpg') },
    { category: 'Collations', name: 'Yaourt nature', kcal: 150, time: 5, image: require('../assets/images/nutrition.jpg') },
  ];

  const renderMeals = (category: string) => {
    const filteredMeals = meals.filter(meal => meal.category === category);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {filteredMeals.map((meal, index) => (
          <View key={index} style={styles.mealSquare}>
            <Image source={meal.image} style={styles.mealImage} />
            <TouchableOpacity onPress={() => navigation.navigate('MealDetails', { meal })}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDetails}>{meal.kcal} kcal - {meal.time} min</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const handleGoalSelection = (goal: string) => {
    setUserGoal(goal);
    if (dailyKcalInput) {
      setDailyKcal(parseInt(dailyKcalInput));
    }
    setEditModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section ImageBackground avec Objectif */}
      <View style={styles.header}>
        <ImageBackground source={require('../assets/images/nutrition.jpg')} style={styles.headerImage}>
          <Text style={styles.headerText}>Mon objectif: {"\n"}</Text><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>{dailyKcal}</Text><Text style={styles.headerText2}>kcal/jour</Text>
          {/* Card Programme en cours */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Votre programme en cours{"\n"}<Text style={styles.cardSubtitle}>{userGoal}</Text></Text>
              <Icon
                name="edit"
                type="material"
                onPress={() => setEditModalVisible(true)}
                containerStyle={styles.editIcon}
              />
            </View>
          </Card>
        </ImageBackground>
      </View>

      {/* Modal pour éditer le programme */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisissez votre objectif</Text>

            {/* Champ de saisie pour les calories */}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Entrez vos calories par jour"
              value={dailyKcalInput}
              onChangeText={(text) => setDailyKcalInput(text)}
            />

            {/* Boutons pour choisir l'objectif */}
            <TouchableOpacity onPress={() => handleGoalSelection('Prise de masse')}>
              <Text style={styles.modalOption}>Prise de masse</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleGoalSelection('Déficit calorique')}>
              <Text style={styles.modalOption}>Déficit calorique</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Section Repas */}
      <View style={styles.mealsSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Petit-déjeuner</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PetitDejeuner')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Petit-déjeuner')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Petit-déjeuner</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DéjeunerDîner')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Déjeuner')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Petit-déjeuner</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Collations')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Collations')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    height: 300, // Augmenter la hauteur de l'en-tête
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20, // Espacement supplémentaire
    fontSize: 22, // Augmenter la taille du texte
    color: 'white',
  },
  headerText2: {
    fontSize: 18, // Augmenter la taille du texte
    color: 'white',
  },
  card: {
    borderRadius: 10,
    margin: 20, // Augmenter la marge
    padding: 20, // Augmenter le padding
    width: '90%', // Ajuster la largeur
    alignSelf: 'center', // Centrer la carte
    backgroundColor: '#1F1F1F',
    
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22, // Augmenter la taille du texte
    fontWeight: 'bold',
    color: 'white',
  },
  cardSubtitle: {
    fontSize: 18, // Augmenter la taille du texte
    color: 'white',
  },
  editIcon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  modalOption: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  mealsSection: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  mealSquare: {
    width: 160,
    height: 210,
    marginRight: 10,
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 1,
    alignItems: 'center',
  },
  mealImage: {
    width: 160,
    height: 130,
    borderTopLeftRadius: 10, // Bord arrondi en haut à gauche
    borderTopRightRadius: 10, // Bord arrondi en haut à droite
    borderBottomLeftRadius: 0, // Pas de bord arrondi en bas à gauche
    borderBottomRightRadius: 0, // Pas de bord arrondi en bas à droite
    marginBottom: 10,
  },
  mealName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  mealDetails: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: '20%',
  },
  moreText: {
    color: '#007bff',
    marginTop: 5,
  },
});

export default NutritionPage;