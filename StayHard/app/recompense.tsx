import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const EvolutionPage = () => {
  // Données factices pour les graphiques
  const [timeData, setTimeData] = useState({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [30, 45, 28, 60, 50, 40, 55], // Temps en minutes
      },
    ],
  });

  const [caloriesData, setCaloriesData] = useState({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [200, 300, 250, 400, 350, 300, 450], // Calories brûlées
      },
    ],
  });

  const [progressData, setProgressData] = useState({
    labels: ['Squat', 'Pompes', 'Course'],
    datasets: [
      {
        data: [70, 50, 90], // Progression en pourcentage
      },
    ],
  });

  // Données factices pour les niveaux et récompenses
  const [level, setLevel] = useState(5);
  const [progress, setProgress] = useState(75); // Progression en pourcentage
  const rewards = ['Niveau 1: Badge Débutant', 'Niveau 3: Badge Intermédiaire', 'Niveau 5: Badge Expert'];

  // Données factices pour les notifications
  const [notifications, setNotifications] = useState([
    'Objectif calories hebdomadaires atteint !',
    'Nouveau niveau débloqué : Niveau 5',
  ]);

  return (
    <ScrollView style={styles.container}>
      {/* Section Graphiques d'évolution */}
      <Text style={styles.sectionTitle}>Graphiques d'évolution</Text>

      {/* Graphique pour le temps d'entraînement */}
      <Text style={styles.chartTitle}>Temps d'entraînement (minutes)</Text>
      <LineChart
        data={timeData}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=" min"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Graphique pour les calories brûlées */}
      <Text style={styles.chartTitle}>Calories brûlées</Text>
      <BarChart
        data={caloriesData}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=" kcal"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Graphique pour la progression des exercices */}
      <Text style={styles.chartTitle}>Progression des exercices (%)</Text>
      <PieChart
        data={progressData.datasets[0].data.map((value, index) => ({
          name: progressData.labels[index],
          population: value,
          color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
          legendFontColor: 'white',
          legendFontSize: 15,
        }))}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />

      {/* Section Calculs de progrès */}
      <Text style={styles.sectionTitle}>Calculs de progrès</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progression vers l'objectif : 75%</Text>
        <Text style={styles.recommendation}>
          Recommandation : Augmentez votre temps d'entraînement de 10 minutes par jour.
        </Text>
      </View>

      {/* Section Comparaison de séances */}
      <Text style={styles.sectionTitle}>Comparaison de séances</Text>
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonText}>Séance 1 : 300 kcal</Text>
        <Text style={styles.comparisonText}>Séance 2 : 450 kcal</Text>
        <Text style={styles.comparisonText}>Amélioration : +150 kcal</Text>
      </View>

      {/* Section Niveaux et récompenses */}
      <Text style={styles.sectionTitle}>Niveaux et récompenses</Text>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Niveau actuel : {level}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.rewardText}>Récompenses débloquées :</Text>
        {rewards.map((reward, index) => (
          <Text key={index} style={styles.rewardItem}>
            - {reward}
          </Text>
        ))}
      </View>

      {/* Section Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.notificationsContainer}>
        {notifications.map((notification, index) => (
          <Text key={index} style={styles.notificationText}>
            - {notification}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

// Configuration des graphiques
const chartConfig = {
  backgroundGradientFrom: '#1E1E1E',
  backgroundGradientTo: '#1E1E1E',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressText: {
    fontSize: 16,
    color: 'white',
  },
  recommendation: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  comparisonContainer: {
    marginVertical: 16,
  },
  comparisonText: {
    fontSize: 16,
    color: 'white',
  },
  levelContainer: {
    marginVertical: 16,
  },
  levelText: {
    fontSize: 16,
    color: 'white',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  rewardText: {
    fontSize: 16,
    color: 'white',
    marginTop: 8,
  },
  rewardItem: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  notificationsContainer: {
    marginVertical: 16,
  },
  notificationText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
});

export default EvolutionPage;