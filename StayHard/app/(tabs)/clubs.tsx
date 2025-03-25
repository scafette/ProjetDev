import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Définition du type Club
class Club {
  id: number;
  name: string;
  address: string;
  description: string;
  city: string;
  phone: string;
  openingHours: string;
  closingHours: string;

  constructor(id: number, name: string, address: string, description: string, city: string, phone: string, openingHours: string, closingHours: string) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.description = description;
    this.city = city;
    this.phone = phone;
    this.openingHours = openingHours;
    this.closingHours = closingHours;
  }
}

// Liste des clubs instanciés avec la classe Club
const clubs: Club[] = [
  new Club(1, 'Fitness Park', '12 rue de Paris', 'Salle équipée de matériel moderne et coachs disponibles.', 'Paris', '01 23 45 67 89', '06:00', '22:00'),
  new Club(2, 'Fitness Park', '15 rue de Lyon', 'Salle avec une variété de cours collectifs et un espace cardio.', 'Lyon', '04 56 78 90 12', '06:30', '23:00'),
  new Club(3, 'Fitness Park', '20 rue de Marseille', 'Salle haut de gamme avec un espace bien-être et sauna.', 'Marseille', '04 91 23 45 67', '07:00', '22:30'),
  new Club(4, 'Basic Fit', '24 avenue des Champs', 'Salle économique avec un large choix de machines.', 'Paris', '01 98 76 54 32', '07:00', '23:00'),
  new Club(5, 'Basic Fit', '10 rue de la République', 'Salle accessible 24/7 avec des tarifs attractifs.', 'Lyon', '04 87 65 43 21', '00:00', '23:59'),
  new Club(6, 'Wellness Sport Club', '8 boulevard Haussmann', 'Salle haut de gamme avec spa et piscine.', 'Paris', '01 11 22 33 44', '08:00', '20:00'),
  new Club(7, 'Neoness', '30 avenue Victor Hugo', 'Salle moderne avec équipements connectés.', 'Bordeaux', '05 67 89 01 23', '06:00', '22:00'),
  new Club(8, 'Neoness', '50 rue de Toulouse', 'Salle avec espace musculation et cardio.', 'Toulouse', '05 45 67 89 10', '07:00', '22:30'),
  new Club(9, 'Keep Cool', '5 rue du Soleil', 'Salle conviviale avec ambiance détendue.', 'Nice', '04 22 33 44 55', '06:30', '21:00'),
  new Club(10, 'Keep Cool', '7 boulevard des Sports', 'Salle spécialisée en coaching personnalisé.', 'Lille', '03 45 67 89 12', '07:00', '23:00'),
  new Club(11, 'Club Med Gym', '88 rue Saint-Denis', 'Salle premium avec des cours variés.', 'Paris', '01 45 67 89 90', '06:00', '22:00'),
  new Club(12, 'Club Med Gym', '12 rue de Provence', 'Salle avec piscine et espace relaxation.', 'Lyon', '04 23 45 67 89', '06:30', '21:30'),
  new Club(13, 'Les Cercles de la Forme', '21 rue du Faubourg', 'Salle avec cours de danse et yoga.', 'Paris', '01 67 89 45 23', '07:00', '22:00'),
  new Club(14, 'Les Cercles de la Forme', '33 rue de la Liberté', 'Salle équipée de plateaux musculation et fitness.', 'Strasbourg', '03 78 90 12 34', '07:30', '22:30'),
];

// Navigation
type RootStackParamList = {
  Clubs: undefined;
  ClubDetail: { club: Club };
};

type ClubsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClubDetail'>;

function ClubsScreen() {
  const navigation = useNavigation<ClubsScreenNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {[...new Set(clubs.map(club => club.name))].map(category => (
        <View key={category} style={{ alignItems: 'center', width: '100%' }}>
          <Text style={styles.category}>{category}</Text>
          {clubs.filter(club => club.name === category).map(club => (
            <TouchableOpacity key={club.id} style={styles.button} onPress={() => navigation.navigate('ClubDetail', { club })}>
              <MaterialCommunityIcons name="arm-flex-outline" size={24} color="white" />
              <Text style={styles.buttonText}>{club.name} - {club.city}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
