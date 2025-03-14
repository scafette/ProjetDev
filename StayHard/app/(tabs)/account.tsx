import { Image, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/pp.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Mon Profil</ThemedText>
      </ThemedView>

      {/* Mes Informations */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Mes Informations</ThemedText>
        <ThemedText>
          Mon nom : blabla blabla{"\n"}
          Mot de passe : blabla{"\n"}
          Mon email : blabla@gmail.com
        </ThemedText>
      </ThemedView>

      {/* Abonnements */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Abonnements</ThemedText>
        <ThemedText>
          Type d'abonnement : blabla{"\n"}
          Moyen de paiement : blabla{"\n"}
          Adresse de livraison : 12 Rue de blabla
        </ThemedText>
      </ThemedView>

      {/* Section Changer de profil / Se déconnecter */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.button} onPress={() => console.log("Changer de profil")}>
          <ThemedText type="defaultSemiBold">Changer de profil</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => console.log("Déconnexion")}>
          <ThemedText type="defaultSemiBold" style={styles.logoutText}>Se déconnecter</ThemedText>
        </TouchableOpacity>
      </View>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    color: '#808080',
    bottom: -60,
    left: -50,
    position: 'absolute'
  },
  footerContainer: {
    marginTop: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    width: '80%',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  logoutText: {
    color: 'white',
  }
});
