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

  // États pour les sélecteurs
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'role' | 'coach' | null>(null);

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
          {showBannedUsers ? 'Vous pourrez bannir les utilisateurs dans prochaine mise à jour' : 'Mise a jour le 28/05/2025'}
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
          {user.sport_goal && (
            <Text style={styles.userDetails}>Objectif: {user.sport_goal}</Text>
          )}
          {user.is_banned && user.ban_reason && (
            <Text style={styles.banReason}>Raison: {user.ban_reason}</Text>
          )}
        </View>
        
        <View style={styles.userActions}>
          {!user.is_banned && (
            <>
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => loadUserDetails(user)}
              >
                <Ionicons name="eye" size={20} color="#3498db" />
              </TouchableOpacity>
            </>
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
        onPress={() => {
          setPickerType('role');
          setShowUserPicker(true);
        }}
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
        onPress={() => {
          setPickerType('coach');
          setShowUserPicker(true);
        }}
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
        <Text style={styles.headerTitle}>PANEL ADMINISTRATION</Text>
      </View>

      {/* Toggle pour basculer entre utilisateurs actifs/bannis */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showBannedUsers && styles.activeToggle]}
          onPress={() => setShowBannedUsers(false)}
        >
          <Text style={[styles.toggleText, !showBannedUsers && styles.activeToggleText]}>
            Actifs ({users.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, showBannedUsers && styles.activeToggle]}
          onPress={() => setShowBannedUsers(true)}
        >
          <Text style={[styles.toggleText, showBannedUsers && styles.activeToggleText]}>
            Bannis ({bannedUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.section}>
        {/* Liste des utilisateurs */}
        {renderUserList()}

        {/* Affichage des sélecteurs uniquement pour les utilisateurs actifs */}
        {!showBannedUsers && renderSelectors()}
      </ScrollView>
      

      {/* Nouveau Modal des détails utilisateur */}
      <Modal
        visible={showUserDetails}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.largeModalCard]}>
            <ScrollView>
              <View style={styles.modalHeaderContainer}>
                <Text style={styles.modalHeader}>
                  {selectedUserDetails?.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedUserDetails?.role} {selectedUserDetails?.is_banned && '(BANNI)'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>{selectedUserDetails?.username}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>{selectedUserDetails?.age} ans</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="speedometer" size={18} color="#7f8c8d" />
                  <Text style={styles.detailText}>{selectedUserDetails?.weight} kg / {selectedUserDetails?.height} cm</Text>
                </View>
                
                {selectedUserDetails?.sport_goal && (
                  <View style={styles.detailRow}>
                    <Ionicons name="trophy" size={18} color="#7f8c8d" />
                    <Text style={styles.detailText}>{selectedUserDetails?.sport_goal}</Text>
                  </View>
                )}
                
                {selectedUserDetails?.coach_id && (
                  <View style={styles.detailRow}>
                    <Ionicons name="person-add" size={18} color="#7f8c8d" />
                    <Text style={styles.detailText}>
                      Coach: {users.find(u => u.id === selectedUserDetails.coach_id)?.name || 'Non assigné'}
                    </Text>
                  </View>
                )}
                
                {selectedUserDetails?.is_banned && selectedUserDetails?.ban_reason && (
                  <View style={styles.detailRow}>
                    <Ionicons name="warning" size={18} color="#e74c3c" />
                    <Text style={[styles.detailText, {color: '#e74c3c'}]}>
                      Raison: {selectedUserDetails.ban_reason}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.sectionTitleModal}>Historique d'entraînements</Text>
              
              {userWorkouts.length > 0 ? (
                userWorkouts.map(workout => (
                  <View key={workout.id} style={styles.workoutItem}>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutType}>{workout.type}</Text>
                      <Text style={styles.workoutDate}>{workout.date}</Text>
                    </View>
                    <Text style={styles.workoutInfo}>Durée: {workout.duration} min</Text>
                    <Text style={styles.workoutInfo}>Statut: {workout.status}</Text>
                    <Text style={styles.workoutExercises}>{workout.exercises}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>Aucun entraînement enregistré</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {selectedUserDetails?.is_banned && (
                <TouchableOpacity
                  style={styles.modalSuccessButton}
                  onPress={() => handleUnbanUser(selectedUserDetails.id)}
                >
                  <Text style={styles.modalPrimaryButtonText}>Débannir</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setShowUserDetails(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nouveau Modal pour sélection utilisateur/coach */}
      <Modal
        visible={showUserPicker || showRolePicker || showCoachPicker}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>
              {showRolePicker ? 'Sélectionner un rôle' : 
               showCoachPicker ? 'Choisir un coach' : 'Sélectionner un utilisateur'}
            </Text>
            
            <ScrollView style={styles.modalScrollContent}>
              {(showRolePicker ? ['user', 'coach', 'admin'] : 
                (showCoachPicker ? coaches : users)).map(item => (
                <TouchableOpacity
                  key={typeof item === 'string' ? item : item.id}
                  style={styles.modalListItem}
                  onPress={() => {
                    if (showRolePicker) {
                      setSelectedRole(item as string);
                      setShowRolePicker(false);
                    } else if (showCoachPicker) {
                      setSelectedCoachId((item as User).id);
                      setShowCoachPicker(false);
                    } else {
                      if (pickerType === 'role') {
                        setSelectedUserForRole((item as User).id);
                      } else {
                        setSelectedUserForCoach((item as User).id);
                      }
                      setShowUserPicker(false);
                    }
                  }}
                >
                  <Text style={styles.modalListItemText}>
                    {typeof item === 'string' ? 
                      (item === 'user' ? 'Utilisateur' : item === 'coach' ? 'Coach' : 'Admin') : 
                      `${item.name} (${item.role})`}
                  </Text>
                  {(showRolePicker && selectedRole === item) || 
                   (showCoachPicker && selectedCoachId === (item as User).id) || 
                   (!showRolePicker && !showCoachPicker && 
                    ((pickerType === 'role' && selectedUserForRole === (item as User).id) || 
                     (pickerType === 'coach' && selectedUserForCoach === (item as User).id))) ? (
                    <Ionicons name="checkmark-circle" size={20} color="#3498db" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => {
                  setShowUserPicker(false);
                  setShowRolePicker(false);
                  setShowCoachPicker(false);
                }}
              >
                <Text style={styles.modalSecondaryButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    color: '#7f8c8d',
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
    fontSize: 16,
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
    marginTop: 5,
  },
  userActions: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 20,
  },
  unbanButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  unbanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 25,
    marginBottom: 15,
  },
  selectInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginTop: 10,
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
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },

  // Nouveaux styles pour les modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  largeModalCard: {
    maxHeight: '90%',
  },
  modalHeaderContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalSubheader: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    marginTop: 10,
    fontSize: 16,
  },
  modalScrollContent: {
    maxHeight: 300,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  modalPrimaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalSecondaryButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  modalSuccessButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalPrimaryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  modalSecondaryButtonText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  modalListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalListItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  detailSection: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  sectionTitleModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  workoutItem: {
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  workoutType: {
    fontWeight: '600',
    color: '#3498db',
  },
  workoutDate: {
    color: '#7f8c8d',
  },
  workoutInfo: {
    color: '#7f8c8d',
    marginBottom: 3,
  },
  workoutExercises: {
    color: '#2c3e50',
    marginTop: 5,
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default AdminPage;