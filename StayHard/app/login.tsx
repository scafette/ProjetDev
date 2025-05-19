import { Image, StyleSheet, Platform, View, TouchableOpacity, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // You're already using Expo Router
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = "172.20.10.6";

export default function HomeScreen() {      
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const fetchUserInfo = async () => {
  if (userId) {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`http://${IP}:5000/user/${userId}`);
      console.log('Informations utilisateur:', response.data);
      setUserInfo(response.data);
      if (response.data.status === 'ban') {
        Alert.alert('Erreur', response.data.raison_ban);
        return;
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
    } finally {
      setIsRefreshing(false);
    }
  }
};

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.post(`http://${IP}:5000/login`, {
        username,
        password,
      });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
        const { user_id } = response.data;
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('user_id', user_id.toString());
        setUserId(user_id);
        await fetchUserInfo(); // Fetch user info after login
        
        router.replace('/'); // Navigate to home after login
        Alert.alert('Succès', 'Connexion réussie !');
      } else {
        console.error('Login failed:', response.data);
        Alert.alert('Erreur', 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la connexion.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Se connecter" onPress={handleLogin} />
      <Text 
        style={styles.link} 
        onPress={() => router.push('/register')} // Use Expo Router's push instead of navigation.navigate
      >
        Pas encore de compte ? Inscrivez-vous
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#121212', // Added dark background for better visibility of white text
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: 'white',
    backgroundColor: '#333', // Darker input background
  },
  link: {
    marginTop: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
});