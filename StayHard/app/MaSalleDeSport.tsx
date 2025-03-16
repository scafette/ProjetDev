import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const MaSalleDeSport = () => {
  const salle = {
    nom: 'Fit & Go',
    adresse: '123 Rue de la Forme, 75001 Paris, France',
    photo: require('../assets/images/masalle.jpg'),
    coordonnees: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    horaires: [
      { jour: 'Lundi', heures: '06:00 - 22:00' },
      { jour: 'Mardi', heures: '06:00 - 22:00' },
      { jour: 'Mercredi', heures: '06:00 - 22:00' },
      { jour: 'Jeudi', heures: '06:00 - 22:00' },
      { jour: 'Vendredi', heures: '06:00 - 22:00' },
      { jour: 'Samedi', heures: '08:00 - 20:00' },
      { jour: 'Dimanche', heures: '08:00 - 18:00' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={salle.photo} style={styles.photo} />
        <View style={styles.mapContainer}>
          {/* Vous pouvez ajouter une carte ici si nécessaire */}
        </View>
      </View>
      <Text style={styles.nomSalle}>{salle.nom}</Text>
      <Text style={styles.adresse}>{salle.adresse}</Text>
      <View style={styles.horairesContainer}>
        <Text style={styles.horairesTitre}>Horaires d'ouverture :</Text>
        {salle.horaires.map((horaire, index) => (
          <View key={index} style={styles.horaireItem}>
            <Text style={styles.jour}>{horaire.jour}</Text>
            <Text style={styles.heures}>{horaire.heures}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fond noir
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 200,
    height: 180,
    borderRadius: 10,
    marginRight: 16,
  },
  mapContainer: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nomSalle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white', // Texte blanc
  },
  adresse: {
    fontSize: 16,
    color: 'white', // Texte blanc
    marginBottom: 16,
  },
  horairesContainer: {
    marginTop: 16,
  },
  horairesTitre: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white', // Texte blanc
  },
  horaireItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jour: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white', // Texte blanc
  },
  heures: {
    fontSize: 16,
    color: 'white', // Texte blanc
  },
});

export default MaSalleDeSport;