import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const IP = "172.20.10.6";

interface Client {
  id: number;
  username: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  sport_goal: string;
}

interface Workout {
  id: number;
  date: string;
  type: string;
  duration: number;
  exercises: string;
  status: string;
  user_id: number;
}

const CoachPage = () => {
  const navigation = useNavigation();
  const [coachId, setCoachId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientWorkouts, setClientWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState('clients');

  // Récupérer le coachId au chargement
  useEffect(() => {
    const fetchCoachId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('coach_id');
        if (storedId) {
          setCoachId(parseInt(storedId));
          fetchClients(parseInt(storedId));
        } else {
          Alert.alert('Erreur', 'Aucun coach ID trouvé');
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur récupération coachId:", error);
        Alert.alert('Erreur', 'Problème de chargement des données');
      }
    };

    fetchCoachId();
  }, []);

  // Fetch clients data
  const fetchClients = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${IP}:5000/coach/clients/${id}`);
      setClients(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la liste des clients');
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workouts for a specific client
  const fetchClientWorkouts = async (clientId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${IP}:5000/workouts/${clientId}`);
      setClientWorkouts(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les séances du client');
      console.error('Fetch workouts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    fetchClientWorkouts(client.id);
    setActiveTab('clientDetail');
  };

  const handleRemoveClient = async () => {
    if (!selectedClient || !reason || !coachId) {
      Alert.alert('Erreur', 'Veuillez fournir une raison pour la résiliation');
      return;
    }

    try {
      await axios.delete(`http://${IP}:5000/coach/remove-client/${selectedClient.id}`, {
        data: { reason, coach_id: coachId }
      });
      
      Alert.alert('Succès', 'Contrat résilié avec succès');
      setSelectedClient(null);
      setReason('');
      fetchClients(coachId);
      setActiveTab('clients');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de résilier le contrat');
      console.error('Remove client error:', error);
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={styles.clientItem}
      onPress={() => handleSelectClient(item)}
    >
      <Text style={styles.clientName}>{item.name}</Text>
      <Text style={styles.clientGoal}>Objectif: {item.sport_goal}</Text>
      <Text style={styles.clientInfo}>{item.age} ans • {item.weight}kg • {item.height}cm</Text>
    </TouchableOpacity>
  );

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <View style={styles.workoutItem}>
      <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.workoutType}>{item.type}</Text>
      <Text style={styles.workoutDuration}>{item.duration} min</Text>
      <Text style={styles.workoutExercises}>{item.exercises}</Text>
      <Text style={[
        styles.workoutStatus,
        item.status === 'approved' ? styles.statusApproved : 
        item.status === 'rejected' ? styles.statusRejected : styles.statusPending
      ]}>
        {item.status === 'approved' ? '✓ Approuvé' : item.status === 'rejected' ? '✗ Rejeté' : '⌛ En attente'}
      </Text>
    </View>
  );

  const renderClientsList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mes Clients ({clients.length})</Text>
      {clients.length > 0 ? (
        <FlatList
          data={clients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={() => coachId && fetchClients(coachId)}
        />
      ) : (
        <Text style={styles.noDataText}>Aucun client assigné</Text>
      )}
    </View>
  );

  const renderClientDetail = () => {
    if (!selectedClient) return null;

    return (
      <ScrollView style={styles.section}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setSelectedClient(null);
            setActiveTab('clients');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
          <Text style={styles.backButtonText}>Retour à la liste</Text>
        </TouchableOpacity>

        <Text style={styles.clientDetailTitle}>Détails du Client</Text>
        
        <View style={styles.clientInfoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom:</Text>
            <Text style={styles.infoValue}>{selectedClient.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Âge:</Text>
            <Text style={styles.infoValue}>{selectedClient.age} ans</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Poids/Taille:</Text>
            <Text style={styles.infoValue}>{selectedClient.weight}kg / {selectedClient.height}cm</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objectif:</Text>
            <Text style={styles.infoValue}>{selectedClient.sport_goal}</Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Historique d'entraînement ({clientWorkouts.length})</Text>
        {clientWorkouts.length > 0 ? (
          <FlatList
            data={clientWorkouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noDataText}>Aucune séance enregistrée</Text>
        )}

        <Text style={styles.subSectionTitle}>Résilier le contrat</Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Entrez la raison de la résiliation..."
          placeholderTextColor="#999"
          value={reason}
          onChangeText={setReason}
          multiline
        />
        <TouchableOpacity
          style={[styles.removeButton, !reason && styles.disabledButton]}
          onPress={handleRemoveClient}
          disabled={!reason}
        >
          <Text style={styles.removeButtonText}>Résilier le contrat</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  if (!coachId) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (loading && activeTab === 'clients') {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeTab === 'clients' ? renderClientsList() : renderClientDetail()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 15,
    color: '#2c3e50',
  },
  clientItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  clientGoal: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  clientInfo: {
    fontSize: 13,
    color: '#95a5a6',
  },
  clientDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  clientInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  infoValue: {
    color: '#7f8c8d',
  },
  workoutItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  workoutDate: {
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 5,
  },
  workoutType: {
    fontStyle: 'italic',
    color: '#3498db',
    marginBottom: 5,
  },
  workoutDuration: {
    color: '#7f8c8d',
    marginBottom: 5,
  },
  workoutExercises: {
    color: '#2c3e50',
    marginTop: 10,
    lineHeight: 20,
  },
  workoutStatus: {
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statusApproved: {
    color: '#27ae60',
  },
  statusRejected: {
    color: '#e74c3c',
  },
  statusPending: {
    color: '#f39c12',
  },
  reasonInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#2c3e50',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 5,
  },
  backButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
    fontSize: 16,
  },
});

export default CoachPage;