import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Fonction pour générer une chaîne aléatoire
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const RandomQRCodeGenerator = () => {
  const [randomData, setRandomData] = useState(generateRandomString());

  // Fonction pour regénérer un QR code avec de nouvelles données aléatoires
  const regenerateQRCode = () => {
    setRandomData(generateRandomString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Générateur de QR Code Aléatoire</Text>
      <QRCode
        value={randomData} // Les données à encoder dans le QR code
        size={200} // Taille du QR code
        color="black" // Couleur du QR code
        backgroundColor="white" // Couleur de fond
      />
      <Text style={styles.dataText}>Données : {randomData}</Text>
      <Button title="Générer un nouveau QR Code" onPress={regenerateQRCode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataText: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default RandomQRCodeGenerator;