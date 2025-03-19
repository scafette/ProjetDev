import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Alert, ScrollView, FlatList, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Subscription {
  id: string;
  name: string;
  price: string;
  color: string;
  features: string[];
}

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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

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
        fetchSubscriptions();
      }
    };

    checkLogin();
  }, [userId]);

  const fetchUserInfo = async () => {
    if (userId) {
      try {
        const response = await axios.get(`http://192.168.1.166:5000/user/${userId}`);
        console.log('Informations utilisateur:', response.data);
        setUserInfo(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
      }
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('http://192.168.1.166:5000/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les abonnements.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user_id');
    navigation.navigate('login');
  };

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <View style={[styles.subscriptionCard, { backgroundColor: item.color }]}>
      <Text style={styles.subscriptionTitle}>{item.name}</Text>
      <Text style={styles.subscriptionPrice}>{item.price}</Text>
      <View style={styles.featuresContainer}>
        {item.features.map((feature: string, index: number) => (
          <Text key={index} style={styles.featureText}>
            • {feature}
          </Text>
        ))}
      </View>
      <TouchableOpacity style={styles.subscriptionButton}>
        <Text style={styles.subscriptionButtonText}>Choisir</Text>
      </TouchableOpacity>
    </View>
  );

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
        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subscriptionList}
        />
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
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: 20,
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
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
    marginBottom: 80,
  },
  footerText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
  subscriptionList: {
    paddingHorizontal: 10,
  },
  subscriptionCard: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  featuresContainer: {
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginVertical: 2,
  },
  subscriptionButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});