import { Image, StyleSheet, Platform, View, TouchableOpacity,Text, TextInput, Button,Alert } from 'react-native';
import axios from 'axios';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  register: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;


const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const { user_id } = response.data;
        Alert.alert('Succès', 'Connexion réussie !');
        // Vous pouvez gérer la navigation vers le profil ici si nécessaire
      } else {
        Alert.alert('Erreur', 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la connexion.');
    }
  };

export default function HomeScreen() {      
const navigation = useNavigation<HomeScreenNavigationProp>(); // Utilisez useNavigation
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
      <Text style={styles.link} onPress={() => navigation.navigate('register')}>
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
  },
  link: {
    marginTop: 16,
    color: '#007BFF',
    textAlign: 'center',
  },
});
