import React, { useEffect, useState } from 'react';
import {Image, StyleSheet, View, TouchableOpacity, Alert, ScrollView, FlatList, Text, ActivityIndicator,} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const IP="172.20.10.6";

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  login: undefined;
  admin: undefined;
  coach: undefined;
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
    role?: string;
    coach_id?: number;
  }>({});
  const [userId, setUserId] = useState<number | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<string>('Simple'); // État pour l'abonnement actuel

  useEffect(() => {
    const initialize = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(parseInt(id, 10));
      }

      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        navigation.navigate('login');
      } else {
        fetchUserInfo();
        // stocker l'id du coach si il existe 
        // fetchSubscriptions();
        // fetchUserSubscription();
      }
    };

    initialize();
  }, [userId]);

  const fetchUserInfo = async () => {
  if (userId) {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`http://${IP}:5000/user/${userId}`);
      console.log('Informations utilisateur:', response.data);
      setUserInfo(response.data);
      
      // Stocker le coach_id si il existe
      if (response.data.coach_id) {
        await AsyncStorage.setItem('coach_id', response.data.coach_id.toString());
        console.log('Coach ID stocké:', response.data.coach_id);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
    } finally {
      setIsRefreshing(false);
    }
  }
};

    //(essaie de faire un abonnement)
  // const fetchSubscriptions = async () => {
  //   try {
  //     const response = await axios.get('http://${IP}:5000/subscriptions');
  //     setSubscriptions(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert('Erreur', 'Impossible de récupérer les abonnements.');
  //   }
  // };

  // const fetchUserSubscription = async () => {
  //   if (userId) {
  //     try {
  //       const response = await axios.get(`http://${IP}:5000/user/${userId}/subscription`);
  //       setCurrentSubscription(response.data.subscription_name);
  //     } catch (error) {
  //       console.error(error);
  //       Alert.alert('Erreur', 'Impossible de récupérer l\'abonnement.');
  //     }
  //   }
  // };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('coach_id');
    navigation.navigate('login');
  };

  const handleSubscriptionChoice = async (subscriptionName: string) => {
    if (subscriptionName === currentSubscription) {
      // Résilier l'abonnement (revenir à "Simple")
      setCurrentSubscription('Simple');
      try {
        await axios.post(`http://${IP}:5000/user/${userId}/subscription`, {
          subscription_name: 'Simple',
        });
        Alert.alert('Succès', 'Abonnement résilié avec succès.');
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de résilier l\'abonnement.');
      }
    } else {
      // Choisir un nouvel abonnement
      setCurrentSubscription(subscriptionName);
      try {
        await axios.post(`http://${IP}:5000/user/${userId}/subscription`, {
          subscription_name: subscriptionName,
        });
        Alert.alert('Succès', 'Abonnement mis à jour avec succès.');
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de mettre à jour l\'abonnement.');
      }
    }
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
      <TouchableOpacity
        style={styles.subscriptionButton}
        onPress={() => handleSubscriptionChoice(item.name)}
      >
        <Text style={styles.subscriptionButtonText}>
          {currentSubscription === item.name ? 'Résilier' : 'Choisir'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header avec image de profil et bouton d'actualisation */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/pp.png')}
          style={styles.profileImage}
        />
        <ThemedText type="title" style={styles.profileName}>
          {userInfo?.name || "Chargement..."}
        </ThemedText>
        <TouchableOpacity onPress={fetchUserInfo} style={styles.refreshButton}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={24} color="#fff" />
          )}
        </TouchableOpacity>
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
          <ThemedText style={styles.infoText}>Rôle : {userInfo.role}</ThemedText>
          <ThemedText style={styles.infoText}>Coach : {userInfo.coach_id}</ThemedText>
        </View>
      </ThemedView>

      {/* Section des abonnements */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Abonnements{"\n"}Prochainement
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

        {userInfo.role === 'admin' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('admin')}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Admin</ThemedText>
          </TouchableOpacity>
        )}

        {userInfo.role === 'coach' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('coach')}>
            <Ionicons name="people" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Clients</ThemedText>
            </TouchableOpacity>
        )}

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
    position: 'relative',
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
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
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