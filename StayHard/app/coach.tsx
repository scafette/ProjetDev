import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { IP } from '@env';

// Définir le type des paramètres de route
type CoachRouteParams = {
  CoachPage: {
    coachId: number;
  };
};

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
  user_name: string;
}

const CoachPage = () => {
  const route = useRoute<RouteProp<CoachRouteParams, 'CoachPage'>>();
  const coachId = route.params?.coachId || 0;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>('-1');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('-1');
  const [reason, setReason] = useState('');

  // Fetch clients and workouts
  const fetchData = async () => {
    if (!coachId) return;
    
    setLoading(true);
    try {
      const [clientsResponse, workoutsResponse] = await Promise.all([
        axios.get(`http://${IP}:5000/coach/clients/${coachId}`),
        axios.get(`http://${IP}:5000/workouts/${coachId}`)
      ]);
      
      setClients(clientsResponse.data);
      setWorkouts(workoutsResponse.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les données');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [coachId]);

  const handleRemoveClient = async () => {
    if (selectedClientId === '-1' || !reason) {
      Alert.alert('Erreur', 'Sélectionnez un client et fournissez une raison');
      return;
    }

    try {
      await axios.delete(`http://${IP}:5000/coach/remove-client/${selectedClientId}`, {
        data: { reason, coach_id: coachId }
      });
      
      Alert.alert('Succès', 'Client supprimé avec succès');
      await fetchData();
      setSelectedClientId('-1');
      setReason('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer le client');
      console.error('Remove client error:', error);
    }
  };

  const handleWorkoutAction = async (action: 'approve' | 'reject') => {
    if (selectedWorkoutId === '-1') return;

    try {
      await axios.put(`http://${IP}:5000/workouts/${selectedWorkoutId}`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
      
      Alert.alert('Succès', `Séance ${action === 'approve' ? 'approuvée' : 'rejetée'}`);
      await fetchData();
      setSelectedWorkoutId('-1');
    } catch (error) {
      Alert.alert('Erreur', `Impossible de ${action === 'approve' ? 'approuver' : 'rejeter'} la séance`);
      console.error('Workout action error:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Tableau de bord Coach</Text>
      
      <Text style={styles.sectionTitle}>Gestion des clients</Text>
      {clients.length > 0 ? (
        <Picker
          selectedValue={selectedClientId}
          style={styles.picker}
          onValueChange={setSelectedClientId}
        >
          <Picker.Item label="Sélectionner un client" value="-1" />
          {clients.map((client) => (
            <Picker.Item key={client.id} label={client.name} value={client.id.toString()} />
          ))}
        </Picker>
      ) : (
        <Text style={styles.infoText}>Aucun client assigné</Text>
      )}

      {selectedClientId !== '-1' && (
        <>
          <TextInput
            style={styles.reasonInput}
            placeholder="Raison de la suppression..."
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <TouchableOpacity
            style={[styles.button, !reason && styles.disabledButton]}
            onPress={handleRemoveClient}
            disabled={!reason}
          >
            <Text style={styles.buttonText}>Supprimer le client</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>Validation des séances</Text>
      {workouts.length > 0 ? (
        <Picker
          selectedValue={selectedWorkoutId}
          style={styles.picker}
          onValueChange={setSelectedWorkoutId}
        >
          <Picker.Item label="Sélectionner une séance" value="-1" />
          {workouts.map((workout) => (
            <Picker.Item 
              key={workout.id} 
              label={`${workout.date} - ${workout.user_name}`} 
              value={workout.id.toString()} 
            />
          ))}
        </Picker>
      ) : (
        <Text style={styles.infoText}>Aucune séance à valider</Text>
      )}

      {selectedWorkoutId !== '-1' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleWorkoutAction('approve')}
          >
            <Text style={styles.buttonText}>Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleWorkoutAction('reject')}
          >
            <Text style={styles.buttonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!coachId) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>ID du coach non disponible</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reasonInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  infoText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default CoachPage;