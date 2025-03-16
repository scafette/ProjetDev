import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const RandomQRCodeGenerator = () => {
  // Lien profond vers la page "ScanInstructions"
  const deepLink = 'stayhard://scan-instructions'; // Utilisez un schéma d'URL personnalisé

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code portiques</Text>
      <QRCode
        value={deepLink} // Utilisez le lien profond ici
        size={350} // Taille du QR code
        color="black" // Couleur du QR code
        backgroundColor="white" // Couleur de fond
      />
      <Text style={styles.dataText}>Veuillez scanner le QR code sur les portiques</Text>
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