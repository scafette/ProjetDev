import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput, ScrollView, ImageBackground, StatusBar, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientWorkouts, setClientWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    goal: '',
    minAge: '',
    maxAge: '',
    minWeight: '',
    maxWeight: ''
  });

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

  useEffect(() => {
    if (clients.length > 0) {
      applyFilters();
    }
  }, [searchQuery, filters, clients]);

  const fetchClients = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${IP}:5000/coach/clients/${id}`);
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la liste des clients');
      console.error('Fetch clients error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const applyFilters = () => {
    let result = [...clients];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.sport_goal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply goal filter
    if (filters.goal) {
      result = result.filter(client => 
        client.sport_goal.toLowerCase() === filters.goal.toLowerCase()
      );
    }

    // Apply age filters
    if (filters.minAge) {
      result = result.filter(client => 
        client.age >= parseInt(filters.minAge)
      );
    }

    if (filters.maxAge) {
      result = result.filter(client => 
        client.age <= parseInt(filters.maxAge)
      );
    }

    // Apply weight filters
    if (filters.minWeight) {
      result = result.filter(client => 
        client.weight >= parseInt(filters.minWeight)
      );
    }

    if (filters.maxWeight) {
      result = result.filter(client => 
        client.weight <= parseInt(filters.maxWeight)
      );
    }

    setFilteredClients(result);
  };

  const resetFilters = () => {
    setFilters({
      goal: '',
      minAge: '',
      maxAge: '',
      minWeight: '',
      maxWeight: ''
    });
    setSearchQuery('');
    setFilteredClients(clients);
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
      <View style={styles.clientContent}>
        <View style={styles.clientAvatar}>
          <FontAwesome5 name="user-alt" size={24} color="#fff" />
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          <Text style={styles.clientGoal}>{item.sport_goal}</Text>
          <View style={styles.clientStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="cake" size={16} color="#fff" />
              <Text style={styles.statText}>{item.age} ans</Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesome5 name="weight" size={16} color="#fff" />
              <Text style={styles.statText}>{item.weight}kg</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="height" size={16} color="#fff" />
              <Text style={styles.statText}>{item.height}cm</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <View style={styles.workoutItem}>
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString('fr-FR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })}</Text>
        <View style={[
          styles.workoutStatus,
          item.status === 'approved' ? styles.statusApproved : 
          item.status === 'rejected' ? styles.statusRejected : styles.statusPending
        ]}>
          <Text style={styles.workoutStatusText}>
            {item.status === 'approved' ? '✓ Approuvé' : 
             item.status === 'rejected' ? '✗ Rejeté' : '⌛ En attente'}
          </Text>
        </View>
      </View>
      
      <View style={styles.workoutContent}>
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="barbell-outline" size={16} color="#6a11cb" />
            <Text style={styles.metaText}>{item.type}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6a11cb" />
            <Text style={styles.metaText}>{item.duration} min</Text>
          </View>
        </View>
        
        <Text style={styles.workoutExercisesTitle}>Exercices:</Text>
        <Text style={styles.workoutExercises}>{item.exercises}</Text>
      </View>
    </View>
  );

  const renderClientsList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mes Clients</Text>
      <Text style={styles.sectionSubtitle}>{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un client..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#6a11cb" />
        </TouchableOpacity>
      </View>
      
      {filteredClients.length > 0 ? (
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={() => coachId && fetchClients(coachId)}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="people-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>Aucun client trouvé</Text>
          <Text style={styles.emptyStateSubtext}>Essayez de modifier vos critères de recherche</Text>
        </View>
      )}
    </View>
  );

  const renderClientDetail = () => {
    if (!selectedClient) return null;

    return (
      <ScrollView style={styles.section} contentContainerStyle={{ paddingBottom: 30 }}>
        <ImageBackground 
          source={require('../assets/images/salle.jpg')} 
          style={styles.clientHeader}
          imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSelectedClient(null);
              setActiveTab('clients');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.clientAvatarLarge}>
            <FontAwesome5 name="user-alt" size={40} color="#fff" />
          </View>
          
          <Text style={styles.clientNameLarge}>{selectedClient.name}</Text>
          <Text style={styles.clientGoalLarge}>{selectedClient.sport_goal}</Text>
        </ImageBackground>

        <View style={styles.clientStatsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedClient.age}</Text>
            <Text style={styles.statLabel}>Âge</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedClient.weight}kg</Text>
            <Text style={styles.statLabel}>Poids</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedClient.height}cm</Text>
            <Text style={styles.statLabel}>Taille</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.subSectionTitle}>Historique d'entraînement</Text>
          <Text style={styles.subSectionSubtitle}>{clientWorkouts.length} séance{clientWorkouts.length !== 1 ? 's' : ''}</Text>
          
          {clientWorkouts.length > 0 ? (
            <FlatList
              data={clientWorkouts}
              renderItem={renderWorkoutItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>Aucune séance enregistrée</Text>
            </View>
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
        </View>
      </ScrollView>
    );
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilters}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer les clients</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6a11cb" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterScroll}>
            <Text style={styles.filterLabel}>Objectif sportif</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Musculation, Perte de poids..."
              value={filters.goal}
              onChangeText={(text) => setFilters({...filters, goal: text})}
            />
            
            <Text style={styles.filterLabel}>Âge</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.filterInput, styles.rangeInput]}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.minAge}
                onChangeText={(text) => setFilters({...filters, minAge: text})}
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={[styles.filterInput, styles.rangeInput]}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.maxAge}
                onChangeText={(text) => setFilters({...filters, maxAge: text})}
              />
            </View>
            
            <Text style={styles.filterLabel}>Poids (kg)</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.filterInput, styles.rangeInput]}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.minWeight}
                onChangeText={(text) => setFilters({...filters, minWeight: text})}
              />
              <Text style={styles.rangeSeparator}>-</Text>
              <TextInput
                style={[styles.filterInput, styles.rangeInput]}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.maxWeight}
                onChangeText={(text) => setFilters({...filters, maxWeight: text})}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, styles.resetButton]}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                applyFilters();
                setShowFilters(false);
              }}
            >
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!coachId) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  if (loading && activeTab === 'clients') {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6a11cb" barStyle="light-content" />
      {activeTab === 'clients' ? renderClientsList() : renderClientDetail()}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
    centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    color: 'white',
  },
  sectionSubtitle: {
    fontSize: 16,
    marginLeft: 20,
    marginBottom: 20,
    color: 'white',
  },
  subSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 10,
    color: '#2c3e50',
  },
  subSectionSubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 15,
  },
  clientItem: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#00b80e',
  },
  clientContent: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clientAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  clientNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
  },
  clientGoal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  clientGoalLarge: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  clientStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
  },
  clientHeader: {
    width: '100%',
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#6a11cb',
  },
  clientStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6a11cb',
  },
  statLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  workoutItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  workoutDate: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 14,
  },
  workoutStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  statusRejected: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusPending: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  workoutStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutContent: {
    marginTop: 10,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  workoutExercisesTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  workoutExercises: {
    color: '#7f8c8d',
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
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
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    elevation: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 15,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#2c3e50',
  },
  filterInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  rangeSeparator: {
    marginHorizontal: 10,
    color: '#95a5a6',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#6a11cb',
  },
  resetButtonText: {
    color: '#6a11cb',
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CoachPage;