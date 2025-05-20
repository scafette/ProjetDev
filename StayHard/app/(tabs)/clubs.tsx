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
  new Club(1, 'Basic Fit', '24 avenue des Champs', 'Salle économique avec un large choix de machines.', 'Paris', '01 98 76 54 32', '07:00', '23:00'),
  new Club(2, 'Basic Fit', '10 rue de la République', 'Salle accessible 24/7 avec des tarifs attractifs.', 'Lyon', '04 87 65 43 21', '00:00', '23:59'),
  new Club(3, 'Basic Fit', '5 rue du Soleil', 'Salle conviviale avec ambiance détendue.', 'Nice', '04 22 33 44 55', '06:30', '21:00'),
  new Club(4, 'Basic Fit', '7 boulevard des Sports', 'Salle spécialisée en coaching personnalisé.', 'Lille', '03 45 67 89 12', '07:00', '23:00'),
  new Club(5, 'Basic Fit', '18 rue de Bretagne', 'Salle moderne avec équipements connectés.', 'Rennes', '02 99 12 34 56', '06:00', '22:00'),
  new Club(6, 'Basic Fit', '22 avenue Jean Jaurès', 'Salle avec espace musculation et cardio.', 'Toulouse', '05 61 23 45 67', '07:00', '22:30'),
  new Club(7, 'Basic Fit', '40 rue de la Liberté', 'Salle équipée de plateaux musculation et fitness.', 'Strasbourg', '03 88 76 54 32', '07:30', '22:30'),
  new Club(8, 'Basic Fit', '12 rue de Provence', 'Salle avec piscine et espace relaxation.', 'Marseille', '04 91 23 45 67', '06:30', '21:30'),
  new Club(9, 'Basic Fit', '1 avenue du Général de Gaulle', 'Salle spacieuse avec parking gratuit.', 'Châtenay-Malabry', '01 46 12 34 56', '06:00', '23:00'),
  new Club(10, 'Basic Fit', '15 rue des Peupliers', 'Salle avec espace crossfit et haltérophilie.', 'Saint-Étienne', '04 77 12 34 56', '07:00', '22:00'),
  new Club(11, 'Basic Fit', '8 avenue des Tilleuls', 'Salle avec espace stretching et yoga.', 'Aix-en-Provence', '04 42 12 34 56', '06:30', '21:30'),
  new Club(12, 'Basic Fit', '13 rue de la Liberté', 'Salle conviviale avec ambiance zen.', 'Clermont-Ferrand', '04 73 12 34 56', '07:00', '22:00'),
  new Club(13, 'Basic Fit', '17 rue du Moulin', 'Salle avec espace cardio et musculation.', 'Rouen', '02 35 12 34 56', '07:00', '22:00'),
  new Club(14, 'Basic Fit', '21 avenue de la Mer', 'Salle moderne avec espace détente.', 'Le Havre', '02 32 12 34 56', '06:00', '22:00'),
  new Club(15, 'Basic Fit', '4 rue des Roses', 'Salle familiale avec coachs diplômés.', 'Metz', '03 87 12 34 56', '07:00', '22:00'),
  new Club(16, 'Basic Fit', '8 avenue du Général', 'Salle avec espace fitness et musculation.', 'Nancy', '03 83 12 34 56', '06:30', '21:30'),
  new Club(17, 'Basic Fit', '14 rue de la Gare', 'Salle conviviale avec cours collectifs.', 'Angers', '02 41 12 34 56', '07:00', '22:00'),
  new Club(18, 'Basic Fit', '19 rue des Écoles', 'Salle moderne avec équipements variés.', 'Tours', '02 47 12 34 56', '07:00', '22:00'),
  new Club(19, 'Basic Fit', '23 avenue des Sports', 'Salle avec espace cardio et musculation.', 'Reims', '03 26 12 34 56', '06:00', '22:00'),
  new Club(20, 'Basic Fit', '9 rue du Château', 'Salle conviviale avec espace musculation.', 'Limoges', '05 55 12 34 56', '06:30', '21:30'),
  new Club(21, 'Basic Fit', '11 rue des Fleurs', 'Salle avec espace musculation et sauna.', 'Grenoble', '04 76 12 34 56', '06:00', '22:00'),
  new Club(22, 'Basic Fit', '2 rue du Parc', 'Salle lumineuse avec machines connectées.', 'Versailles', '01 39 12 34 56', '07:00', '22:00'),
  new Club(23, 'Basic Fit', '6 avenue des Champs', 'Salle avec espace détente et machines connectées.', 'Perpignan', '04 68 12 34 56', '07:00', '22:00'),
  new Club(24, 'Basic Fit', '25 avenue de la Gare', 'Salle moderne avec équipements dernier cri.', 'Montpellier', '04 67 12 34 56', '07:00', '23:00'),
  new Club(25, 'Basic Fit', '3 rue du Stade', 'Salle avec espace cardio et cours collectifs.', 'Bordeaux', '05 56 78 90 12', '06:30', '22:30'),
  new Club(26, 'Basic Fit', '9 rue de la Paix', 'Salle conviviale avec espace détente.', 'Dijon', '03 80 12 34 56', '07:00', '22:00'),
  new Club(27, 'Basic Fit', '5 rue des Lilas', 'Salle spacieuse avec zone poids libres.', 'Nantes', '02 40 12 34 56', '07:00', '22:00'),
  new Club(28, 'Basic Fit', '7 boulevard des Capucines', 'Salle avec espace musculation et fitness.', 'Paris', '01 42 12 34 56', '06:00', '23:00'),
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
