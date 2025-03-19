import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert, ScrollView, } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker'; // Pour la sélection d'image
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function SettingsScreen() {
  const [userInfo, setUserInfo] = useState({
    username: '',
    name: '',
    age: '',
    weight: '',
    height: '',
    sport_goal: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // États pour le changement de mot de passe
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`http://192.168.1.166:5000/user/${userId}`);
      setUserInfo({
        username: response.data.username || '',
        name: response.data.name || '',
        age: response.data.age ? response.data.age.toString() : '',
        weight: response.data.weight ? response.data.weight.toString() : '',
        height: response.data.height ? response.data.height.toString() : '',
        sport_goal: response.data.sport_goal || '',
      });
      setProfileImage(response.data.profile_image || null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour choisir une image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Vous pouvez également envoyer cette image à votre serveur pour la sauvegarder
    }
  };

  const handleSaveChanges = async () => {
    if (userId) {
      try {
        await axios.put(`http://192.168.1.166:5000/user/${userId}`, {
          username: userInfo.username,
          name: userInfo.name,
          age: parseInt(userInfo.age, 10),
          weight: parseFloat(userInfo.weight),
          height: parseFloat(userInfo.height),
          sport_goal: userInfo.sport_goal,
        });
        Alert.alert('Succès', 'Informations mises à jour avec succès !');
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour des informations.');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!userId) {
      Alert.alert('Erreur', 'Utilisateur non identifié.');
      return;
    }

    if (!oldPassword || !newPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.put(`http://192.168.1.166:5000/user/${userId}/change-password`, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (response.status === 200) {
        Alert.alert('Succès', 'Mot de passe mis à jour avec succès !');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Erreur', 'Ancien mot de passe incorrect.');
      } else {
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du mot de passe.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section pour changer l'image de profil */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Image de profil
        </ThemedText>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={profileImage ? { uri: profileImage } : require('@/assets/images/pp.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Section pour modifier les informations personnelles */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Informations personnelles
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={userInfo.username}
          onChangeText={(text) => setUserInfo({ ...userInfo, username: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={userInfo.name}
          onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Âge"
          value={userInfo.age}
          onChangeText={(text) => setUserInfo({ ...userInfo, age: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Poids (kg)"
          value={userInfo.weight}
          onChangeText={(text) => setUserInfo({ ...userInfo, weight: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Taille (cm)"
          value={userInfo.height}
          onChangeText={(text) => setUserInfo({ ...userInfo, height: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Objectif sportif"
          value={userInfo.sport_goal}
          onChangeText={(text) => setUserInfo({ ...userInfo, sport_goal: text })}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <ThemedText style={styles.saveButtonText}>Enregistrer les modifications</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Section pour changer le mot de passe */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Changer le mot de passe
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ancien mot de passe"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
          <ThemedText style={styles.saveButtonText}>Changer le mot de passe</ThemedText>
        </TouchableOpacity>
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
    backgroundColor: 'black',
    padding: 20,
  },
  section: {
    marginBottom: 20,
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#00b80e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#1F1F1F',
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
  },
  footerText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});