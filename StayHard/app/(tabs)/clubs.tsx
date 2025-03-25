import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icônes
import { useNavigation } from '@react-navigation/native'; // Importation de useNavigation
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Clubs: undefined;
  ClubDetail: { club: Club };
};

type Club = {
  id: number;
  name: string;
  address: string;
  description: string;
  city: string;
  phone: string;
  openingHours: string;
  closingHours: string;
};

// Liste des clubs avec plus de détails
const clubs: Club[] = [
  // Fitness Park
  {
    id: 1,
    name: 'Fitness Park',
    address: '12 rue de Paris',
    description: 'Salle équipée de matériel moderne et coachs disponibles.',
    city: 'Paris',
    phone: '01 23 45 67 89',
    openingHours: '06:00',
    closingHours: '22:00',
  },
  {
    id: 2,
    name: 'Fitness Park',
    address: '15 rue de Lyon',
    description: 'Salle avec une variété de cours collectifs et un espace cardio.',
    city: 'Lyon',
    phone: '04 56 78 90 12',
    openingHours: '06:30',
    closingHours: '23:00',
  },
  {
    id: 3,
    name: 'Fitness Park',
    address: '20 rue de Marseille',
    description: 'Salle haut de gamme avec un espace bien-être et sauna.',
    city: 'Marseille',
    phone: '04 91 23 45 67',
    openingHours: '07:00',
    closingHours: '22:30',
  },
  {
    id: 4,
    name: 'Fitness Park',
    address: '25 rue de Bordeaux',
    description: 'Salle dédiée à l’entraînement de force et fitness.',
    city: 'Bordeaux',
    phone: '05 56 78 90 12',
    openingHours: '06:00',
    closingHours: '21:30',
  },
  {
    id: 5,
    name: 'Fitness Park',
    address: '30 rue de Toulouse',
    description: 'Salle avec des équipements dernier cri pour tous les niveaux.',
    city: 'Toulouse',
    phone: '05 61 23 45 67',
    openingHours: '07:00',
    closingHours: '23:00',
  },
  // Basic Fit
  {
    id: 6,
    name: 'Basic Fit',
    address: '24 avenue des Champs',
    description: 'Salle économique avec un large choix de machines.',
    city: 'Paris',
    phone: '01 98 76 54 32',
    openingHours: '07:00',
    closingHours: '23:00',
  },
  {
    id: 7,
    name: 'Basic Fit',
    address: '10 rue de la République',
    description: 'Salle accessible 24/7 avec des tarifs attractifs.',
    city: 'Lyon',
    phone: '04 87 65 43 21',
    openingHours: '00:00',
    closingHours: '23:59',
  },
  {
    id: 8,
    name: 'Basic Fit',
    address: '8 boulevard de la Gare',
    description: 'Salle ouverte toute la journée, idéale pour les entraînements individuels.',
    city: 'Marseille',
    phone: '04 91 54 32 10',
    openingHours: '07:00',
    closingHours: '22:00',
  },
  {
    id: 9,
    name: 'Basic Fit',
    address: '22 avenue de Bordeaux',
    description: 'Salle avec équipements modernes et tarifs abordables.',
    city: 'Bordeaux',
    phone: '05 56 89 23 45',
    openingHours: '06:30',
    closingHours: '23:00',
  },
  {
    id: 10,
    name: 'Basic Fit',
    address: '14 rue de Toulouse',
    description: 'Salle avec des machines pour tous les niveaux.',
    city: 'Toulouse',
    phone: '05 62 78 90 12',
    openingHours: '06:00',
    closingHours: '22:30',
  },
  // Wellness Sport Club
  {
    id: 11,
    name: 'Wellness Sport Club',
    address: '8 boulevard Haussmann',
    description: 'Salle haut de gamme avec spa et piscine.',
    city: 'Paris',
    phone: '01 11 22 33 44',
    openingHours: '08:00',
    closingHours: '20:00',
  },
  {
    id: 12,
    name: 'Wellness Sport Club',
    address: '12 rue du Parc',
    description: 'Salle avec des services de bien-être et de relaxation.',
    city: 'Lyon',
    phone: '04 72 34 56 78',
    openingHours: '09:00',
    closingHours: '21:00',
  },
  {
    id: 13,
    name: 'Wellness Sport Club',
    address: '15 avenue du Sud',
    description: 'Salle avec des équipements de luxe et des coachs privés.',
    city: 'Marseille',
    phone: '04 91 65 43 21',
    openingHours: '08:30',
    closingHours: '21:30',
  },
  {
    id: 14,
    name: 'Wellness Sport Club',
    address: '20 rue de l’Étoile',
    description: 'Salle avec un centre de bien-être et un spa.',
    city: 'Bordeaux',
    phone: '05 57 65 43 21',
    openingHours: '09:00',
    closingHours: '22:00',
  },
  {
    id: 15,
    name: 'Wellness Sport Club',
    address: '25 rue des Arènes',
    description: 'Salle avec piscine et services exclusifs.',
    city: 'Toulouse',
    phone: '05 61 65 43 21',
    openingHours: '09:00',
    closingHours: '21:30',
  },
];

type ClubsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClubDetail'>;

function ClubsScreen() {
  const navigation = useNavigation<ClubsScreenNavigationProp>(); // Utilisation de useNavigation pour naviguer

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Affichage des clubs par catégorie */}
      <Text style={styles.category}>Fitness Park</Text>
      {clubs
        .filter((club) => club.name === 'Fitness Park')
        .map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.button}
            onPress={() => navigation.navigate('ClubDetail', { club })}
          >
            <Ionicons name="fitness-outline" size={24} color="white" />
            <Text style={styles.buttonText}>{club.name} - {club.city}</Text>
          </TouchableOpacity>
        ))}

      <Text style={styles.category}>Basic Fit</Text>
      {clubs
        .filter((club) => club.name === 'Basic Fit')
        .map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.button}
            onPress={() => navigation.navigate('ClubDetail', { club })}
          >
            <Ionicons name="fitness-outline" size={24} color="white" />
            <Text style={styles.buttonText}>{club.name} - {club.city}</Text>
          </TouchableOpacity>
        ))}

      <Text style={styles.category}>Wellness Sport Club</Text>
      {clubs
        .filter((club) => club.name === 'Wellness Sport Club')
        .map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.button}
            onPress={() => navigation.navigate('ClubDetail', { club })}
          >
            <Ionicons name="fitness-outline" size={24} color="white" />
            <Text style={styles.buttonText}>{club.name} - {club.city}</Text>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}

function ClubDetailScreen({ route }: { route: { params: { club: Club } } }) {
  const { club } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{club.name}</Text>
      <Text style={styles.address}>📍 {club.address}</Text>
      <Text style={styles.city}>🌆 {club.city}</Text>
      <Text style={styles.phone}>📞 {club.phone}</Text>
      <Text style={styles.hours}>🕒 {club.openingHours} - {club.closingHours}</Text>
      <Text style={styles.description}>{club.description}</Text>
    </View>
  );
}

// Création du Stack Navigator
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator<RootStackParamList>();

export default function Clubs() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Clubs" component={ClubsScreen} options={{ title: 'Salles de Sport' }} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} options={{ title: 'Détails du Club' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1F1F1F',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#00b80e',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  address: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  city: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  phone: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  hours: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  category: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
});
