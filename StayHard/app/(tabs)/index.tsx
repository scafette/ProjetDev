import React from 'react';
import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Planning: undefined; // Ajoutez d'autres écrans ici
  exercice: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation

  return (
    <ScrollView style={styles.container}>
      {/* Section Titre */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{"Bonjour\n Bassem !"}</ThemedText>
      </ThemedView>

      {/* Carte Planning */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Planning')} // Naviguer vers l'écran Planning
      >
        <ThemedView style={styles.cardContent}>
          <Ionicons name="calendar-outline" size={24} color="#00b80e" />
          <ThemedText style={styles.cardText}>
            <ThemedText>Planning{"\n"}</ThemedText>
            <ThemedText style={styles.smallText}>Accéder au planning</ThemedText>
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      {/* Section MON CLUB avec image en arrière-plan */}
      <ThemedView style={styles.sectionContainer}>
        <ImageBackground
          source={require('../../assets/images/monclub.png')}
          style={styles.clubImageBackground}
          imageStyle={styles.clubImageStyle}
        >
          <ThemedText style={styles.clubOverlayText}>
            <ThemedText style={styles.clubSubtitle}>MON CLUB{"\n"}</ThemedText>
            <ThemedText style={styles.clubTitle}>LA SALLE DE SPORTS CLUB</ThemedText>
          </ThemedText>
        </ImageBackground>
      </ThemedView>


      {/* Section Cartes D'accès et Gagne des recompenses sur les exo */}
      <ThemedView style={styles.sectionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ThemedView style={styles.card}>
        <Ionicons name="card-outline" size={24} color="#00b80e" />
        <ThemedText style={styles.cardText}>
          <ThemedText>Carte d'accès{"\n"}</ThemedText>
          <ThemedText style={styles.smallText}>Valide jusqu'au 31/12/2021</ThemedText>
        </ThemedText>
          </ThemedView>
          <ThemedView style={styles.card}>
        <Ionicons name="trophy-outline" size={24} color="#00b80e" />
        <ThemedText style={styles.cardText}>
          <ThemedText>Gagne{"\n"}des récompenses grace au exo</ThemedText>
        </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      {/* Section Exercice ou tu peux defililer pour voir plusieur exercice et un button voir tou les exercice */}
      <TouchableOpacity style={styles.card1}>
        <ThemedView style={styles.sectionContainer1}>
          <ThemedText type="subtitle">EXERCICES</ThemedText>
          <ThemedText type="subtitle">{"\n"}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedView style={styles.sportCard}>
          <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
        <ThemedView style={styles.sportCard}>
        <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
        <ThemedView style={styles.sportCard}>
        <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
        <ThemedView style={styles.sportCard}>
        <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
        <ThemedView style={styles.sportCard}>
        <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
        <ThemedView style={styles.sportCard}>
        <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
            <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Yoga</ThemedText>
          </ImageBackground>
        </ThemedView>
          </ScrollView>
          <ThemedText type="subtitle">{"\n"}</ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('exercice')}>
            <ThemedText style={styles.cardText1}>Voir tous les exercices > </ThemedText>
            </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>



       




      {/* Section Case Nutrition et a coter case Entrainement */}
            <ThemedView style={styles.nutritionTrainingContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Carte Nutrition */}
          <ThemedView style={styles.nutritionCard}>
          <Ionicons name="nutrition-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.nutritionCardText}>
              <ThemedText>NUTRITION{"\n"}</ThemedText>
            </ThemedText>
          </ThemedView>

          {/* Carte Entraînement */}
          <ThemedView style={styles.trainingCard}>
          <Ionicons name="barbell-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.trainingCardText}>
              <ThemedText>ENTRAINEMENT</ThemedText>
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>
      
         
      {/* Section Actualités */}
      <ThemedView style={styles.Actu}>
  <ThemedText type="subtitle">ACTUALITÉS</ThemedText>

  {/* Première actualité */}
  <TouchableOpacity onPress={() => console.log('Élément cliqué')}>
    <ThemedView style={styles.exerciseItem}>
      <Ionicons name="newspaper-outline" size={24} color="#00b80e" />
      <ThemedText style={styles.exerciseText}>Nouvelles machines de cardio</ThemedText>
      {/* Bouton Effacer */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => console.log('Effacer cette actualité')}
      >
        <Ionicons name="close-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </ThemedView>
  </TouchableOpacity>

  {/* Deuxième actualité */}
  <TouchableOpacity onPress={() => console.log('Élément cliqué')}>
    <ThemedView style={styles.exerciseItem}>
      <Ionicons name="newspaper-outline" size={24} color="#00b80e" />
      <ThemedText style={styles.exerciseText}>Nouveau cours de yoga</ThemedText>
      {/* Bouton Effacer */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => console.log('Effacer cette actualité')}
      >
        <Ionicons name="close-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </ThemedView>
  </TouchableOpacity>
</ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  sectionContainer1: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card1: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    paddingTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    
  },
  cardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  cardText1: {
    marginLeft: 80,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  smallText: {
    fontSize: 12,
    color: '#808080',
    marginTop: 4,
  },
  clubImageBackground: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  clubImageStyle: {
    borderRadius: 10,
    top: -10,
  },
  clubOverlayText: {
    textAlign: 'center',
  },
  clubSubtitle: {
    fontSize: 12,
    marginRight: 300,
    color: '#808080',
    fontWeight: 'bold',
  },
  clubTitle: {
    marginTop: 4,
    marginRight: 220,
    fontSize: 12,
    color: '#FFFFFF',
  },
  sportCard: {
    width: 120,
    height: 100,
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  sportCardImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  sportCardTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseText: {
    marginLeft: 8,
    fontSize: 16,
  },

  nutritionTrainingContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },

  // Style pour la carte Nutrition
  nutritionCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginRight: 10, // Espace entre les cartes
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pour Android
    width: 170, // Largeur fixe pour la carte
    height: 120,
  },

  // Style pour le texte de la carte Nutrition
  nutritionCardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Style pour la carte Entraînement
  trainingCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginRight: 10, // Espace entre les cartes
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pour Android
    width: 215, // Largeur fixe pour la carte
  },

  // Style pour le texte de la carte Entraînement
  trainingCardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  Actu: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pour Android
  },
  exerciseText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  Actu: {
    marginBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pour Android
    position: 'relative', // Permet de positionner le bouton "Effacer"
  },
  exerciseText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1, // Permet au texte de prendre tout l'espace disponible
  },
  deleteButton: {
    position: 'absolute', // Positionne le bouton par rapport à son parent
    top: 8, // Espace depuis le haut
    right: 8, // Espace depuis la droite
    padding: 4, // Espace intérieur pour un meilleur clic
  },
});
