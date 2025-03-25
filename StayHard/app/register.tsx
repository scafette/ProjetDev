import { Image, StyleSheet, Platform, View, TouchableOpacity,Text, TextInput, Button,Alert,ScrollView } from 'react-native';
import axios from 'axios';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Assurez-vous d'avoir installé @expo/vector-icons
import { useNavigation } from '@react-navigation/native'; // Importez useNavigation
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { NavigationProp, RouteProp } from '@react-navigation/native';
const IP="172.20.10.6";

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
  login: undefined;
  profile: { userId: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;


export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>(); // ✅ Utilisation correcte
  
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [sportGoal, setSportGoal] = useState('');
  
    const handleRegister = async () => {
      if (!username || !password || !name || !age || !weight || !height || !sportGoal) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }
  
      try {
        const response = await axios.post(`http://${IP}:5000/register`, {
          username,
          password,
          name,
          age: parseInt(age, 10),
          weight: parseFloat(weight),
          height: parseFloat(height),
          sport_goal: sportGoal,
        });

        console.log(response);
  
        if (response.status === 201) {
          Alert.alert('Succès', 'Inscription réussie !');
          navigation.navigate('login'); // ✅ Navigation après succès
        } else {
          Alert.alert('Erreur', 'Une erreur s\'est produite lors de l\'inscription.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de l\'inscription.');
      }
    };
  
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Inscription</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Âge"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
        <TextInput
          style={styles.input}
          placeholder="Poids (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Taille (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Objectif sportif"
          value={sportGoal}
          onChangeText={setSportGoal}
        />
        <Button title="S'inscrire" onPress={handleRegister} />
        <Text style={styles.link} onPress={() => navigation.navigate('login')}>
          Déjà un compte ? Connectez-vous
        </Text>
      </ScrollView>
    );
  }
  

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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

