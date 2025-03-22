import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  sport_goal: string;
  role: string;
  coach_id: number | 0;
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
  sport_goal: string;
  coach_id: number | 0;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('-1'); // Default value as string
  const [selectedRole, setSelectedRole] = useState<string>('user'); // Default value as string
  const [selectedCoachId, setSelectedCoachId] = useState<string>('-1'); // Default value as string

  // Fetch users and workouts
  const fetchData = async () => {
    try {
      const usersResponse = await axios.get('http://192.168.1.166:5000/admin/users');
      const workoutsResponse = await axios.get('http://192.168.1.166:5000/admin/workouts');
      setUsers(usersResponse.data);
      setWorkouts(workoutsResponse.data);
      console.log('Users:', usersResponse.data);
      console.log('Workouts:', workoutsResponse.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les données.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle role change
  const handleRoleChange = async () => {
    if (selectedUserId === '-1') return; // Check if a user is selected

    try {
      await axios.put(`http://192.168.1.166:5000/admin/change-role/${selectedUserId}`, { role: selectedRole });
      Alert.alert('Succès', 'Rôle mis à jour avec succès.');
      fetchData(); // Reload data
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le rôle.');
      console.error('Role change error:', error);
    }
  };

  // Handle coach assignment
  const handleAssignCoach = async () => {
    if (selectedUserId === '-1' || selectedCoachId === '-1') return; // Check if user and coach are selected

    try {
      await axios.put(`http://192.168.1.166:5000/admin/assign-coach/${selectedUserId}`, { coach_id: selectedCoachId });
      Alert.alert('Succès', 'Coach assigné avec succès.');
      fetchData(); // Reload data
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner le coach.');
      console.error('Assign coach error:', error);
    }
  };

  // Filter coaches
  const coaches = users.filter((user) => user.role === 'coach');

  // Render header
  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Page Admin</Text>
      </View>

      {/* Role change section */}
      <Text style={styles.sectionTitle}>Changer le rôle d'un utilisateur</Text>
      {users.length > 0 ? (
        <Picker
          selectedValue={selectedUserId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedUserId(itemValue.toString())} // Ensure value is string
        >
          <Picker.Item label="Sélectionner un utilisateur" value="-1" />
          {users.map((user) => (
            <Picker.Item key={user.id} label={user.name} value={user.id.toString()} /> // Convert ID to string
          ))}
        </Picker>
      ) : (
        <Text style={styles.errorText}>Aucun utilisateur disponible</Text>
      )}
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

      {/* Coach assignment section */}
      <Text style={styles.sectionTitle}>Assigner un coach</Text>
      {users.length > 0 ? (
        <Picker
          selectedValue={selectedUserId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedUserId(itemValue.toString())} // Ensure value is string
        >
          <Picker.Item label="Sélectionner un utilisateur" value="-1" />
          {users.map((user) => (
            <Picker.Item key={user.id} label={user.name} value={user.id.toString()} /> // Convert ID to string
          ))}
        </Picker>
      ) : (
        <Text style={styles.errorText}>Aucun utilisateur disponible</Text>
      )}
      {coaches.length > 0 ? (
        <Picker
          selectedValue={selectedCoachId}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedCoachId(itemValue.toString())} // Ensure value is string
        >
          <Picker.Item label="Sélectionner un coach" value="-1" />
          {coaches.map((coach) => (
            <Picker.Item key={coach.id} label={coach.name} value={coach.id.toString()} /> // Convert ID to string
          ))}
        </Picker>
      ) : (
        <Text style={styles.errorText}>Aucun coach disponible</Text>
      )}
      <View style={styles.buttonContainer}>
        <Text style={styles.button} onPress={handleAssignCoach}>
          Assigner le coach
        </Text>
      </View>

      {/* Upcoming workouts section */}
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default AdminPage;