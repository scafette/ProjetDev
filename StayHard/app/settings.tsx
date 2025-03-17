import { StyleSheet, SectionList, Switch, Text, View, Platform, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker'; // Pour la sélection d'image
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const settingsData = [
  {
    title: 'Affichage',
    data: [
      { key: 'darkMode', label: 'Mode sombre', type: 'switch' },
    ],
  },
  {
    title: 'Notifications',
    data: [
      { key: 'pushNotifications', label: 'Notifications push', type: 'switch' },
      { key: 'silenceNotifications', label: 'Ne pas déranger', type: 'switch' },
    ],
  },
  {
    title: 'Confidentialité',
    data: [
      { key: 'locationAccess', label: 'Accès à la localisation', type: 'switch' },
      { key: 'camAccess', label: 'Accès à la caméra', type: 'switch' },
      { key: 'micAccess', label: 'Accès au microphone', type: 'switch' },
    ],
  },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    darkMode: false,
    pushNotifications: true,
    locationAccess: false,
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    sport_goal: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    if (user_id) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/user/${user_id}`);
        setUserInfo(response.data);
        setProfileImage(response.data.profile_image || null); // Si vous avez une image de profil dans l'API
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Impossible de récupérer les informations de l\'utilisateur.');
      }
    }
  };

  const toggleSwitch = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    const user_id = await AsyncStorage.getItem('user_id');
    if (user_id) {
      try {
        await axios.put(`http://127.0.0.1:5000/user/${user_id}`, userInfo);
        Alert.alert('Succès', 'Informations mises à jour avec succès !');
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour des informations.');
      }
    }
  };

  // Header personnalisé pour la SectionList
  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={require('@/assets/images/settingsgear.png')}
        style={styles.headerImage}
      />
      <ThemedText type="title" style={styles.title}>
        Paramètres
      </ThemedText>

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
    </View>
  );

  return (
    <SectionList
      sections={settingsData}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>{item.label}</Text>
          {item.type === 'switch' && (
            <Switch
              value={settings[item.key]}
              onValueChange={() => toggleSwitch(item.key)}
            />
          )}
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      ListHeaderComponent={renderHeader} // Ajouter le header personnalisé
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
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
    color: '#007bff',
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
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#007bff',
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 10,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#007bff',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
});