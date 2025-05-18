import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const IP = "172.20.10.6";

interface User {
  id: number;
  username: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  sport_goal: string;
  role: string;
  coach_id: number | null;
  is_banned?: boolean;
  ban_reason?: string;
}

interface Workout {
  id: number;
  date: string;
  type: string;
  duration: number;
  exercises: string;
  status: string;
}

const AdminPage = () => {
  // États principaux
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBannedUsers, setShowBannedUsers] = useState(false);
  
  // États pour le bannissement
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [userToBan, setUserToBan] = useState<User | null>(null);
  
  // États pour la gestion des rôles
  const [selectedUserForRole, setSelectedUserForRole] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [showRolePicker, setShowRolePicker] = useState(false);
  
  // États pour l'assignation de coach
  const [selectedUserForCoach, setSelectedUserForCoach] = useState<number | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [showCoachPicker, setShowCoachPicker] = useState(false);
  
  // États pour la visualisation des détails
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, bannedRes] = await Promise.all([
          axios.get(`http://${IP}:5000/admin/users`),
          axios.get(`http://${IP}:5000/admin/banned-users`)
        ]);
        
        setUsers(usersRes.data);
        setBannedUsers(bannedRes.data);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger les données');
        console.error('Loading error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setLoading(true);
    try {
      const [usersRes, bannedRes] = await Promise.all([
        axios.get(`http://${IP}:5000/admin/users`),
        axios.get(`http://${IP}:5000/admin/banned-users`)
      ]);
      
      setUsers(usersRes.data);
      setBannedUsers(bannedRes.data);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du bannissement
  const handleBanUser = async () => {
    if (!userToBan || !banReason) {
      Alert.alert('Erreur', 'Veuillez saisir une raison');
      return;
    }

    try {
      await axios.put(`http://${IP}:5000/admin/ban-user/${userToBan.id}`, { 
        reason: banReason 
      });
      Alert.alert('Succès', `${userToBan.name} a été banni`);
      setBanModalVisible(false);
      setBanReason('');
      refreshData();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec du bannissement');
      console.error('Ban error:', error);
    }
  };

  // Gestion du débannissement
  const handleUnbanUser = async (userId: number) => {
    try {
      await axios.put(`http://${IP}:5000/admin/unban-user/${userId}`);
      Alert.alert('Succès', 'Utilisateur réactivé');
      refreshData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec du débannissement');
      console.error('Unban error:', error);
    }
  };

  // Gestion du changement de rôle
  const handleRoleChange = async () => {
    if (!selectedUserForRole) {
      Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      await axios.put(`http://${IP}:5000/admin/change-role/${selectedUserForRole}`, { 
        role: selectedRole 
      });
      Alert.alert('Succès', 'Rôle mis à jour avec succès');
      refreshData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la modification du rôle');
      console.error('Role change error:', error);
    }
  };

  // Gestion de l'assignation de coach
  const handleAssignCoach = async () => {
    if (!selectedUserForCoach || !selectedCoachId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur et un coach');
      return;
    }

    try {
      await axios.put(`http://${IP}:5000/admin/assign-coach/${selectedUserForCoach}`, { 
        coach_id: selectedCoachId 
      });
      Alert.alert('Succès', 'Coach assigné avec succès');
      refreshData();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'assignation du coach');
      console.error('Assign coach error:', error);
    }
  };

  // Chargement des détails utilisateur
  const loadUserDetails = async (user: User) => {
    try {
      const workoutsRes = await axios.get(`http://${IP}:5000/workouts/${user.id}`);
      setSelectedUserDetails(user);
      setUserWorkouts(workoutsRes.data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  // Filtre des coachs disponibles
  const coaches = users.filter(user => user.role === 'coach');

  // Rendu de la liste des utilisateurs
  const renderUserList = () => {
    const data = showBannedUsers ? bannedUsers : users;
    
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      );
    }

    if (data.length === 0) {
      return (
        <Text style={styles.noResultsText}>
          {showBannedUsers ? 'Aucun utilisateur banni' : 'Aucun utilisateur trouvé'}
        </Text>
      );
    }

    return data.map(user => (
      <View key={user.id} style={[
        styles.userCard,
        user.is_banned && styles.bannedUserCard
      ]}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.name} ({user.username}) - {user.role}
            {user.is_banned && ' (BANNI)'}
          </Text>
          <Text style={styles.userDetails}>
            {user.age} ans • {user.weight}kg • {user.height}cm
          </Text>
          {user.is_banned && user.ban_reason && (
            <Text style={styles.banReason}>Raison: {user.ban_reason}</Text>
          )}
        </View>
        
        <View style={styles.userActions}>
          {!user.is_banned && (
            <>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => loadUserDetails(user)}
              >
                <Ionicons name="eye" size={20} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.banButton}
                onPress={() => {
                  setUserToBan(user);
                  setBanModalVisible(true);
                }}
              >
                <Ionicons name="ban" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </>
          )}
          {user.is_banned && (
            <TouchableOpacity 
              style={styles.unbanButton}
              onPress={() => handleUnbanUser(user.id)}
            >
              <Text style={styles.unbanButtonText}>Débannir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ));
  };

  // Rendu des sélecteurs
  const renderSelectors = () => (
    <>
      {/* Sélecteur de rôle */}
      <Text style={styles.sectionTitle}>Changer le rôle</Text>
      
      <TouchableOpacity 
        style={styles.selectInput}
        onPress={() => setShowRolePicker(true)}
      >
        <Text style={selectedUserForRole ? styles.selectInputText : styles.selectInputPlaceholder}>
          {users.find(u => u.id === selectedUserForRole)?.name || 'Sélectionner un utilisateur'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.selectInput}
        onPress={() => setShowRolePicker(true)}
      >
        <Text style={styles.selectInputText}>
          {selectedRole === 'user' ? 'Utilisateur' : selectedRole === 'coach' ? 'Coach' : 'Admin'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, !selectedUserForRole && styles.disabledButton]}
        onPress={handleRoleChange}
        disabled={!selectedUserForRole}
      >
        <Text style={styles.actionButtonText}>Modifier le rôle</Text>
      </TouchableOpacity>

      {/* Sélecteur de coach */}
      <Text style={styles.sectionTitle}>Assignation de coach</Text>
      
      <TouchableOpacity 
        style={styles.selectInput}
        onPress={() => setShowUserForCoachPicker(true)}
      >
        <Text style={selectedUserForCoach ? styles.selectInputText : styles.selectInputPlaceholder}>
          {users.find(u => u.id === selectedUserForCoach)?.name || 'Sélectionner un utilisateur'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.selectInput}
        onPress={() => setShowCoachPicker(true)}
      >
        <Text style={selectedCoachId ? styles.selectInputText : styles.selectInputPlaceholder}>
          {coaches.find(c => c.id === selectedCoachId)?.name || 'Sélectionner un coach'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7f8c8d" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, (!selectedUserForCoach || !selectedCoachId) && styles.disabledButton]}
        onPress={handleAssignCoach}
        disabled={!selectedUserForCoach || !selectedCoachId}
      >
        <Text style={styles.actionButtonText}>Assigner le coach</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administration</Text>
      </View>

      {/* Toggle pour basculer entre utilisateurs actifs/bannis */}
      <View style={styles.toggleBanViewContainer}>
        <TouchableOpacity
          style={[styles.toggleBanViewButton, !showBannedUsers && styles.activeToggleButton]}
          onPress={() => setShowBannedUsers(false)}
        >
          <Text style={[styles.toggleBanViewText, !showBannedUsers && styles.activeToggleText]}>
            Utilisateurs actifs ({users.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleBanViewButton, showBannedUsers && styles.activeToggleButton]}
          onPress={() => setShowBannedUsers(true)}
        >
          <Text style={[styles.toggleBanViewText, showBannedUsers && styles.activeToggleText]}>
            Utilisateurs bannis ({bannedUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.section}>
        {/* Liste des utilisateurs */}
        {renderUserList()}

        {/* Affichage des sélecteurs uniquement pour les utilisateurs actifs */}
        {!showBannedUsers && renderSelectors()}
      </ScrollView>

      {/* Modal de bannissement */}
      <Modal
        visible={banModalVisible}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setBanModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.banModalContent}>
          <Text style={styles.banModalTitle}>
            Bannir {userToBan?.name} ({userToBan?.role})
          </Text>
          
          <Text style={styles.banModalText}>
            Veuillez indiquer la raison du bannissement :
          </Text>
          
          <TextInput
            style={styles.banReasonInput}
            placeholder="Raison du bannissement..."
            placeholderTextColor="#95a5a6"
            value={banReason}
            onChangeText={setBanReason}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.banModalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setBanModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.confirmBanButton, !banReason && styles.disabledButton]}
              onPress={handleBanUser}
              disabled={!banReason}
            >
              <Text style={styles.confirmBanButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal des détails utilisateur */}
      <Modal
        visible={showUserDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserDetails(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowUserDetails(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.detailsModalContent}>
          <Text style={styles.detailsModalTitle}>
            Détails de {selectedUserDetails?.name}
          </Text>
          
          <View style={styles.userInfoSection}>
            <Text style={styles.userInfoText}>Username: {selectedUserDetails?.username}</Text>
            <Text style={styles.userInfoText}>Âge: {selectedUserDetails?.age}</Text>
            <Text style={styles.userInfoText}>Poids: {selectedUserDetails?.weight} kg</Text>
            <Text style={styles.userInfoText}>Taille: {selectedUserDetails?.height} cm</Text>
            <Text style={styles.userInfoText}>Objectif: {selectedUserDetails?.sport_goal}</Text>
            <Text style={styles.userInfoText}>Rôle: {selectedUserDetails?.role}</Text>
            {selectedUserDetails?.coach_id && (
              <Text style={styles.userInfoText}>
                Coach: {users.find(u => u.id === selectedUserDetails.coach_id)?.name || 'Non assigné'}
              </Text>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>Historique d'entraînements</Text>
          <ScrollView style={styles.workoutsContainer}>
            {userWorkouts.length > 0 ? (
              userWorkouts.map(workout => (
                <View key={workout.id} style={styles.workoutCard}>
                  <Text style={styles.workoutType}>{workout.type}</Text>
                  <Text style={styles.workoutDate}>Date: {workout.date}</Text>
                  <Text style={styles.workoutDuration}>Durée: {workout.duration} min</Text>
                  <Text style={styles.workoutExercises}>Exercices: {workout.exercises}</Text>
                  <Text style={styles.workoutStatus}>Statut: {workout.status}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noWorkoutsText}>Aucun entraînement enregistré</Text>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.closeDetailsButton}
            onPress={() => setShowUserDetails(false)}
          >
            <Text style={styles.closeDetailsButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modals pour les sélecteurs */}
      {/* Modal pour sélection rôle */}
      <Modal
        visible={showRolePicker}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setShowRolePicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner un rôle</Text>
          <ScrollView>
            {['user', 'coach', 'admin'].map(role => (
              <TouchableOpacity
                key={role}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedRole(role);
                  setShowRolePicker(false);
                }}
              >
                <Text style={styles.modalItemText}>
                  {role === 'user' ? 'Utilisateur' : role === 'coach' ? 'Coach' : 'Admin'}
                </Text>
                {selectedRole === role && (
                  <Ionicons name="checkmark" size={20} color="#3498db" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal pour sélection coach */}
      <Modal
        visible={showCoachPicker}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setShowCoachPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sélectionner un coach</Text>
          <ScrollView>
            {coaches.map(coach => (
              <TouchableOpacity
                key={coach.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCoachId(coach.id);
                  setShowCoachPicker(false);
                }}
              >
                <Text style={styles.modalItemText}>{coach.name}</Text>
                {selectedCoachId === coach.id && (
                  <Ionicons name="checkmark" size={20} color="#3498db" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// Styles (identique à la version précédente)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  toggleBanViewContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 15,
    marginTop: 15,
  },
  toggleBanViewButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#3498db',
  },
  toggleBanViewText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: 'white',
  },
  section: {
    flex: 1,
    paddingHorizontal: 15,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  bannedUserCard: {
    backgroundColor: '#fde8e8',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userDetails: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 3,
  },
  banReason: {
    color: '#e74c3c',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 3,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#e8f4fc',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  banButton: {
    backgroundColor: '#fde8e8',
    padding: 8,
    borderRadius: 20,
  },
  unbanButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 5,
  },
  unbanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  banModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    marginTop: '30%',
  },
  banModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  banModalText: {
    color: '#2c3e50',
    marginBottom: 10,
  },
  banReasonInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    color: '#2c3e50',
  },
  banModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  confirmBanButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    flex: 2,
    alignItems: 'center',
  },
  confirmBanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
    fontStyle: 'italic',
  },
  selectInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  selectInputText: {
    color: '#2c3e50',
    fontSize: 16,
  },
  selectInputPlaceholder: {
    color: '#95a5a6',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  detailsModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    marginTop: '10%',
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  userInfoSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  userInfoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  workoutsContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  workoutCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  workoutType: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  workoutDate: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  workoutDuration: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  workoutExercises: {
    color: '#2c3e50',
    marginTop: 5,
  },
  workoutStatus: {
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: 3,
  },
  noWorkoutsText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  closeDetailsButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeDetailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminPage;