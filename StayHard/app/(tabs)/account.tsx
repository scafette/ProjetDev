import { Image, StyleSheet, Platform, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    age?: number;
    weight?: number;
    height?: number;
    sport_goal?: string;
  }>({});
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(parseInt(id, 10));
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        navigation.navigate('login');
      } else {
        fetchUserInfo();
      }
    };

    checkLogin();
  }, [userId]);

  const fetchUserInfo = async () => {
    if (userId) {
      try {
        const response = await axios.get(`http://192.168.1.166:5000/user/${userId}`);
        console.log('Informations utilisateur:', response.data); // Log pour vérifier les données
        setUserInfo(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user_id');
    navigation.navigate('login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec image de profil */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pp.png')}
          style={styles.profileImage}
        />
        <ThemedText type="title" style={styles.profileName}>
          {userInfo?.name || "Chargement..."}
        </ThemedText>
      </View>

      {/* Section des informations personnelles */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Mes Informations
        </ThemedText>
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>Âge : {userInfo?.age}</ThemedText>
          <ThemedText style={styles.infoText}>Poids : {userInfo?.weight} kg</ThemedText>
          <ThemedText style={styles.infoText}>Taille : {userInfo?.height} cm</ThemedText>
          <ThemedText style={styles.infoText}>Objectif : {userInfo?.sport_goal}</ThemedText>
        </View>
      </ThemedView>

      {/* Section des abonnements */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Abonnements
        </ThemedText>
        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>Type d'abonnement : Premium</ThemedText>
          <ThemedText style={styles.infoText}>Moyen de paiement : Carte Visa</ThemedText>
          <ThemedText style={styles.infoText}>Adresse : 12 Rue de blabla</ThemedText>
        </View>
      </ThemedView>

      {/* Boutons d'actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('settings')}>
          <Ionicons name="settings" size={20} color="#fff" />
          <ThemedText style={styles.actionButtonText}>Paramètres</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <ThemedText style={styles.actionButtonText}>Déconnexion</ThemedText>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'black',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#1F1F1F',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    marginTop: 10,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00b80e',
  },
  infoContainer: {
    marginLeft: 10,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: 'white',
  },
  actionsContainer: {
    margin: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#1F1F1F',
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
  },
  footerText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});