import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, ImageBackground, Image, TextInput, Alert } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: Meal };
  PetitDejeuner: undefined;
  DéjeunerDîner: undefined;
  Collations: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

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

const NutritionPage = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [userGoal, setUserGoal] = useState('Prise de masse');
  const [dailyKcal, setDailyKcal] = useState(2500);
  const [dailyKcalInput, setDailyKcalInput] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState('');

  // Récupérer les plats depuis l'API Flask
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get('http://192.168.1.166:5000/nutrition');
        setMeals(response.data);
        console.log('Plats:', response.data);
      } catch (error) {
        setError('Erreur lors de la récupération des plats');
        Alert.alert('Erreur', 'Impossible de récupérer les plats. Vérifiez votre connexion ou l\'URL de l\'API.');
        console.error('Erreur:', error);
      }
    };

    fetchMeals();
  }, []);

  // Filtrer les plats par catégorie
  const renderMeals = (category: string) => {
    const filteredMeals = meals.filter(meal => meal.category === category);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {filteredMeals.map((meal, index) => (
          <View key={index} style={styles.mealSquare}>
            <Image source={{ uri: meal.image }} style={styles.mealImage} />
            <TouchableOpacity onPress={() => navigation.navigate('MealDetails', { meal })}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDetails}>{meal.calories} kcal - {meal.preparation_time} min</Text>
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
          <Text style={styles.headerText}>Mon objectif: {"\n"}</Text>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>{dailyKcal}</Text>
          <Text style={styles.headerText2}>kcal/jour</Text>
          {/* Card Programme en cours */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Votre programme en cours{"\n"}</Text>
              <Text style={styles.cardSubtitle}>{userGoal}</Text>
              <Icon
                name="edit"
                type="material"
                onPress={() => setEditModalVisible(true)}
                containerStyle={styles.editIcon}
                color={'white'}
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
        {renderMeals('Petit déjeuner')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Diner</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DéjeunerDîner')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Diner')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Collations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Collations')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Collation')}
      </View>

      {/* Affichage des erreurs */}
      {error && <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    height: 300,
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
    marginBottom: 20,
    fontSize: 22,
    color: 'white',
  },
  headerText2: {
    fontSize: 18,
    color: 'white',
  },
  card: {
    borderRadius: 10,
    margin: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1F1F1F',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  cardSubtitle: {
    fontSize: 18,
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
    marginTop: '10%',
  },
  moreText: {
    color: '#007bff',
    marginTop: 5,
  },
});

export default NutritionPage;