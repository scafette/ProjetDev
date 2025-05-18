import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = "172.20.10.6";

export default function Verify2FAScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { userId } = useLocalSearchParams();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code valide à 6 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`http://${IP}:5000/verify-2fa`, {
        user_id: userId,
        code,
      });

      if (response.status === 200) {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('user_id', userId.toString());
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', 'Code incorrect');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Erreur', 
        error.response?.data?.message || 'Une erreur est survenue lors de la vérification'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post(`http://${IP}:5000/resend-2fa`, {
        user_id: userId,
      });
      setCountdown(60);
      setCanResend(false);
      Alert.alert('Succès', 'Un nouveau code a été envoyé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer un nouveau code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification en 2 étapes</Text>
      <Text style={styles.subtitle}>
        Un code à 6 chiffres a été envoyé à votre numéro de téléphone
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Entrez le code"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
        maxLength={6}
      />
      
      <Button
        title={isLoading ? "Vérification..." : "Vérifier"}
        onPress={handleVerify}
        disabled={isLoading}
      />
      
      {canResend ? (
        <Text style={styles.resendLink} onPress={handleResendCode}>
          Renvoyer le code
        </Text>
      ) : (
        <Text style={styles.countdown}>
          Vous pourrez demander un nouveau code dans {countdown} secondes
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 5,
  },
  resendLink: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
  countdown: {
    marginTop: 20,
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
});