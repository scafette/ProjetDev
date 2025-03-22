import React, { useState } from 'react';
import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

type RootStackParamList = {
  Home: undefined;
  Planning: undefined; // Ajoutez d'autres écrans ici
  exercice: undefined;
  Qrcode: undefined;
  nutrition: undefined;
  MaSalleDeSport: undefined;
  recompense: undefined;
  ZoneCardio: undefined;
  ZoneMusculation: undefined;
  ZoneFunctionalTraining: undefined;
  ZoneÉtirementetMobilité: undefined;
  ZoneCrossFitHIIT: undefined;
  ZoneRécupération: undefined;
  admin: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation

  // État pour gérer les actualités
  const [news, setNews] = useState([
    {
      id: '1',
      title: 'Nouvelles machines de cardio',
    },
    {
      id: '2',
      title: 'Nouveau cours de yoga',
    },
    {
      id: '3',
      title: 'Fermeture exceptionnelle le 30 mars',
    },

  ]);

  // Fonction pour supprimer une actualité
  const removeNews = (id: string) => {
    setNews((prevNews) => prevNews.filter((item) => item.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section Titre */}
      <ThemedView style={styles.titleContainer}>
        {/* <ThemedText type="title">{"Bonjour\n" + (username || "Invité") + " !"}</ThemedText> */}
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
      <TouchableOpacity onPress={() => navigation.navigate('MaSalleDeSport')}>
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
      </TouchableOpacity>

      {/* Section Cartes D'accès et Gagne des récompenses sur les exo */}
      <ThemedView style={styles.sectionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Access Card */}
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Qrcode')}>
            <Ionicons name="card-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.cardText}>
              Carte d'accès{"\n"}
              <ThemedText style={styles.smallText}>Valide jusqu'au 31/12/2021</ThemedText>
            </ThemedText>
          </TouchableOpacity>

          {/* Récompenses Card */}
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('recompense')}>
            <Ionicons name="trophy-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.cardText}>
              Gagne{"\n"}des récompenses grâce à l'exo
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>

      {/* Section Exercice ou tu peux défiler pour voir plusieurs exercices et un bouton "Voir tous les exercices" */}
      <TouchableOpacity style={styles.card1}>
        <ThemedView style={styles.sectionContainer1}>
          <ThemedText type="subtitle">EXERCICES</ThemedText>
          <ThemedText type="subtitle">{"\n"}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneCardio')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone Cardio</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneMusculation')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone Musculation</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneFunctionalTraining')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone Functional Training</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneÉtirementetMobilité')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone Étirement et Mobilité</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneCrossFitHIIT')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone CrossFit / HIIT</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.sportCard}>
              <TouchableOpacity onPress={() => navigation.navigate('ZoneRécupération')}>
                <ImageBackground source={require('../../assets/images/exercice1.jpeg')} style={styles.sportCardImage}>
                  <ThemedText type="defaultSemiBold" style={styles.sportCardTextOverlay}>Zone Récupération</ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
          <ThemedText type="subtitle">{"\n"}</ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate('exercice')}>
            <ThemedText style={styles.cardText1}>Voir tous les exercices > </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>

      {/* Section Case Nutrition et à côté case Entraînement */}
      <ThemedView style={styles.nutritionTrainingContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Carte Nutrition */}
          <TouchableOpacity style={styles.nutritionCard} onPress={() => navigation.navigate('nutrition')}>
            <Ionicons name="nutrition-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.nutritionCardText}>
              <ThemedText>NUTRITION</ThemedText>
            </ThemedText>
          </TouchableOpacity>

          {/* Carte Entraînement */}
          <TouchableOpacity style={styles.nutritionCard} onPress={() => navigation.navigate('admin')}>
            <Ionicons name="barbell-outline" size={24} color="#00b80e" />
            <ThemedText style={styles.trainingCardText}>
              <ThemedText>ENTRAINEMENT</ThemedText>
            </ThemedText>
            </TouchableOpacity>
        </ScrollView>
      </ThemedView>

      {/* Section Actualités */}
      <ThemedView style={styles.Actu}>
        <ThemedText type="subtitle">ACTUALITÉS</ThemedText>

        {/* Afficher les actualités dynamiquement */}
        {news.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => console.log('Élément cliqué')}>
            <ThemedView style={styles.exerciseItem}>
              <Ionicons name="newspaper-outline" size={24} color="#00b80e" />
              <ThemedText style={styles.exerciseText}>{item.title}</ThemedText>
              {/* Bouton Effacer */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeNews(item.id)} // Supprimer l'actualité
              >
                <Ionicons name="close-outline" size={20} color="#FF4444" />
              </TouchableOpacity>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>
      {/* Section Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>@Créé par Elmir Elias, Giovanni Mascaro, Ilyes Zekri</ThemedText>
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
    marginTop: 56,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(180, 177, 177, 0.47)',
    padding: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    fontSize: 12,
    color: 'black',
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
    height: 120,
  },
  nutritionCardText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    
  },
  trainingCard: {
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
    width: 215,
  },
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
    elevation: 3,
    position: 'relative',
  },
  exerciseText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  footer: {
    backgroundColor: '#1F1F1F', // Couleur de fond du footer
    padding: 26, // Espace intérieur
    alignItems: 'center', // Centrer le texte horizontalement
    justifyContent: 'center', // Centrer le texte verticalement
    marginTop: 4, // Espacement par rapport à la section précédente
    marginBottom: 84, // Espacement par rapport à la section suivante
    borderTopWidth: 1, // Bordure supérieure
    borderTopColor: '#00b80e', // Couleur de la bordure
  },
  footerText: {
    fontSize: 14, // Taille de la police
    color: '#808080', // Couleur du texte
    textAlign: 'center', // Centrer le texte
  },
});