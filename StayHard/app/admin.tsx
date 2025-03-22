import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  coach_id: number | null;
}

interface Workout {
  id: number;
  user_id: number;
  date: string;
  type: string;
  duration: number;
  status: string;
  user_name: string;
  coach_id: number | null;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number>(-1); // Valeur par défaut
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [selectedCoachId, setSelectedCoachId] = useState<number>(-1); // Valeur par défaut

  // Récupérer les utilisateurs et les séances
  const fetchData = async () => {
    try {
      const usersResponse = await axios.get('http://172.20.10.6:5000/admin/users');
      const workoutsResponse = await axios.get('http://172.20.10.6:5000/admin/workouts');
      setUsers(usersResponse.data);
      setWorkouts(workoutsResponse.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async () => {
    if (selectedUserId === -1) return; // Vérifiez si l'utilisateur est sélectionné

    try {
      await axios.put(`http://172.20.10.6:5000/admin/change-role/${selectedUserId}`, { role: selectedRole });
      Alert.alert('Succès', 'Rôle mis à jour avec succès.');
      fetchData(); // Recharger les données
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rôle.');
    }
  };

  // Assigner un coach à un utilisateur
  const handleAssignCoach = async () => {
    if (selectedUserId === -1 || selectedCoachId === -1) return; // Vérifiez si l'utilisateur et le coach sont sélectionnés

    try {
      await axios.put(`http://172.20.10.6:5000/admin/assign-coach/${selectedUserId}`, { coach_id: selectedCoachId });
      Alert.alert('Succès', 'Coach assigné avec succès.');
      fetchData(); // Recharger les données
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner le coach.');
    }
  };

  // Filtrage des utilisateurs par rôle
  const coaches = users.filter((user) => user.role === 'coach');

  // En-tête pour la FlatList
  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Page Admin</Text>
      </View>

      {/* Section Changer le rôle */}
      <Text style={styles.sectionTitle}>Changer le rôle d'un utilisateur</Text>
      <Picker
        selectedValue={selectedUserId}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedUserId(itemValue)}
      >
        <Picker.Item label="Sélectionner un utilisateur" value={-1} /> {/* Valeur par défaut */}
        {users.map((user) => (
          <Picker.Item key={user.id} label={user.name} value={user.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedRole}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedRole(itemValue)}
      >
        <Picker.Item label="User" value="user" />
        <Picker.Item label="Coach" value="coach" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>
      <View style={styles.buttonContainer}>
        <Text style={styles.button} onPress={handleRoleChange}>
          Changer le rôle
        </Text>
      </View>

      {/* Section Assigner un coach */}
      <Text style={styles.sectionTitle}>Assigner un coach</Text>
      <Picker
        selectedValue={selectedUserId}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedUserId(itemValue)}
      >
        <Picker.Item label="Sélectionner un utilisateur" value={-1} /> {/* Valeur par défaut */}
        {users.map((user) => (
          <Picker.Item key={user.id} label={user.name} value={user.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedCoachId}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCoachId(itemValue)}
      >
        <Picker.Item label="Sélectionner un coach" value={-1} /> {/* Valeur par défaut */}
        {coaches.map((coach) => (
          <Picker.Item key={coach.id} label={coach.name} value={coach.id} />
        ))}
      </Picker>
      <View style={styles.buttonContainer}>
        <Text style={styles.button} onPress={handleAssignCoach}>
          Assigner le coach
        </Text>
      </View>

      {/* Section Séances à venir */}
      <Text style={styles.sectionTitle}>Séances à venir</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={workouts}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardText}>Date: {item.date}</Text>
          <Text style={styles.cardText}>Type: {item.type}</Text>
          <Text style={styles.cardText}>Durée: {item.duration} min</Text>
          <Text style={styles.cardText}>Statut: {item.status}</Text>
          <Text style={styles.cardText}>Utilisateur: {item.user_name}</Text>
          <Text style={styles.cardText}>Coach ID: {item.coach_id || 'Aucun'}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00b80e',
    padding: 10,
    borderRadius: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminPage;