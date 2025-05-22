import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, ImageBackground, Image, TextInput, Alert } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import axios from 'axios';
const IP="172.20.10.6";

type RootStackParamList = {
  Home: undefined;
  MealDetails: { meal: Meal };
  PetitDejeuner: undefined;
  DéjeunerDîner: undefined;
  Collations: undefined;
  MealList: { category: string }; // Ajoute cette ligne
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
        const response = await axios.get(`http://${IP}:5000/nutrition`);
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

  // Filtrer les plats par catégorie et n'afficher que 3 plats
  const renderMeals = (category: string) => {
    const filteredMeals = meals.filter(meal => meal.category === category).slice(0, 3);

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

  // Fonction pour naviguer vers la page des plats
  const navigateToMeals = (category: string) => {
    navigation.navigate('MealList', { category });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section ImageBackground avec Objectif */}
      <View style={styles.header}>
        <ImageBackground source={require('../assets/images/nutrition.jpg')} style={styles.headerImage}>
          <View style={styles.headerContent}>
            <Text style={styles.headerText}>Mon objectif:</Text>
            <Text style={styles.kcalText}>{dailyKcal}</Text>
            <Text style={styles.headerText2}>kcal/jour</Text>
            {/* Card Programme en cours */}
            <Card containerStyle={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Votre programme en cours</Text>
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
          </View>
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
        {renderMeals('Dîner')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Collations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Collations')}>
            <ThemedText style={styles.moreText}>Afficher Plus </ThemedText>
          </TouchableOpacity>
        </View>
        {renderMeals('Collation')}
      </View>

      {/* Affichage des erreurs */}
      <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {/* Carte SPECIAL PRISE DE MASSE */}
        <TouchableOpacity style={styles.nutritionCard} onPress={() => navigateToMeals('Special prise de masse')}>
            <ImageBackground source={require('../assets/images/special_prise_de_masse.jpg')} style={styles.nutritionCardImage} imageStyle={{ borderRadius: 10 }}>
            <ThemedText style={styles.nutritionCardText}>
              <ThemedText>SPECIAL PRISE DE MASSE</ThemedText>
            </ThemedText>
          </ImageBackground>
        </TouchableOpacity>

        {/* Carte prise de masse */}
        <TouchableOpacity style={styles.nutritionCard} onPress={() => navigateToMeals('Prise de masse')}>
          <Ionicons name="barbell-outline" size={24} color="#00b80e" />
          <ThemedText style={styles.nutritionCardText}>
            <ThemedText>Prise de masse</ThemedText>
          </ThemedText>
        </TouchableOpacity>

        {/* Carte deficit calorique */}
        <TouchableOpacity style={styles.nutritionCard} onPress={() => navigateToMeals('Déficit calorique')}>
          <Ionicons name="flame-outline" size={24} color="#00b80e" />
          <ThemedText style={styles.nutritionCardText}>
            <ThemedText>Déficit calorique</ThemedText>
          </ThemedText>
        </TouchableOpacity>

        {/* Carte seche */}
        <TouchableOpacity style={styles.nutritionCard} onPress={() => navigateToMeals('Sèche')}>
          <Ionicons name="leaf-outline" size={24} color="#00b80e" />
          <ThemedText style={styles.nutritionCardText}>
            <ThemedText>Sèche</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: 'black',
  },
  header: {
    height: 300,
    position: 'relative',
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    color: 'white',
    marginBottom: 5,
  },
  kcalText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 5,
  },
  headerText2: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1F1F1F',
  },
  cardContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  cardSubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    width: '100%',
  },
  editIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
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

  nutritionTrainingContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  nutritionCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 170,
    height: 220,
    
  },
  nutritionCardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    
  },
  nutritionCardImage: {
    width: 170,
    height: 220,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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

export default NutritionPage;