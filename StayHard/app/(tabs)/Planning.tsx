import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker';
const IP="172.20.10.6";


// Types de sports disponibles
const sportTypes = [
  { label: 'Course à pied', value: 'Course à pied', color: 'black' },
  { label: 'Cyclisme', value: 'Cyclisme', color: 'black' },
  { label: 'Natation', value: 'Natation', color: 'black' },
  { label: 'Musculation', value: 'Musculation', color: 'black' },
  { label: 'Yoga', value: 'Yoga', color: 'black' },
];

// Exercices disponibles par type de sport
const exercisesByType: { [key: string]: string[] } = {
  'Course à pied': ['Footing', 'Fractionné', 'Endurance'],
  Cyclisme: ['Sortie longue', 'Montée', 'Entraînement intensif'],
  Natation: ['Brasse', 'Crawl', 'Papillon'],
  Musculation: ['Squat', 'Développé couché', 'Tractions'],
  Yoga: ['Salutation au soleil', 'Posture de l\'arbre', 'Posture du guerrier'],
};

// Styles personnalisés pour RNPickerSelect
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#00b80e',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingRight: 30,
    backgroundColor: '#2D2D2D',
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#00b80e',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingRight: 30,
    backgroundColor: '#2D2D2D',
    marginBottom: 16,
  },
  placeholder: {
    color: '#808080',
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
};

// Types pour les séances
type Session = {
  id: string;
  date: string;
  type: string;
  duration: number; // Durée en secondes
  exercises: string;
};

export default function PlanningScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    date: '',
    type: '',
    duration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    exercises: '',
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(parseInt(id, 10));
      }
    };
    fetchUserId();
  }, []);

  // Récupérer les séances depuis le serveur
  const fetchSessions = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://${IP}:5000/workouts/${userId}`);
      if (response.status === 200) {
        console.log('Séances récupérées:', response.data); // Log pour vérifier les données
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la récupération des séances.');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  // Ajouter une séance
  const handleAddSession = async () => {
    if (!form.date || !form.type || !form.exercises) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const newSession = {
      user_id: userId,
      date: form.date,
      type: form.type,
      duration: form.duration.hours * 3600 + form.duration.minutes * 60 + form.duration.seconds,
      exercises: form.exercises,
    };

    try {
      const response = await axios.post(`http://${IP}:5000/workout`, newSession);
      if (response.status === 201) {
        Alert.alert('Succès', 'Séance ajoutée avec succès !');
        setSessions([...sessions, response.data]);
        setForm({ date: '', type: '', duration: { hours: 0, minutes: 0, seconds: 0 }, exercises: '' });
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de l\'ajout de la séance.');
    }
  };

  // Modifier une séance
  const handleEditSession = async () => {
    if (!selectedSession || !userId) return;

    const updatedSession = {
      id: selectedSession.id,
      user_id: userId,
      date: form.date,
      type: form.type,
      duration: form.duration.hours * 3600 + form.duration.minutes * 60 + form.duration.seconds,
      exercises: form.exercises,
    };

    try {
      const response = await axios.put(`http://${IP}:5000/workout/${selectedSession.id}`, updatedSession);
      if (response.status === 200) {
        Alert.alert('Succès', 'Séance modifiée avec succès !');
        const updatedSessions = sessions.map((session) =>
          session.id === selectedSession.id ? updatedSession : session
        );
        setSessions(updatedSessions);
        setModalVisible(false);
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la modification de la séance.');
    }
  };

  // Supprimer une séance
  const handleDeleteSession = async (id: string) => {
    try {
      const response = await axios.delete(`http://${IP}:5000/workout/${id}`);
      if (response.status === 200) {
        Alert.alert('Succès', 'Séance supprimée avec succès !');
        setSessions(sessions.filter((session) => session.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la suppression de la séance.');
    }
  };

  // Ouvrir le modal pour modifier une séance
  const openEditModal = (session: Session) => {
    setSelectedSession(session);
    setForm({
      date: session.date,
      type: session.type,
      duration: {
        hours: Math.floor(session.duration / 3600),
        minutes: Math.floor((session.duration % 3600) / 60),
        seconds: session.duration % 60,
      },
      exercises: session.exercises,
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  // Ouvrir le modal pour ajouter une séance
  const openAddModal = () => {
    setForm({ date: '', type: '', duration: { hours: 0, minutes: 0, seconds: 0 }, exercises: '' });
    setIsEditing(false);
    setModalVisible(true);
  };

  // Gestion du sélecteur de date pour mobile
  const handleDateChangeMobile = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setForm({ ...form, date: formattedDate });
    }
  };

  // Gestion du changement de type de sport
  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value || '', exercises: '' });
    setSelectedExercises(exercisesByType[value] || []);
  };

  // Filtrer les séances en fonction de la date actuelle
  const currentDate = new Date().toISOString().split('T')[0];
  const pastSessions = sessions.filter((session) => session.date < currentDate);
  const upcomingSessions = sessions.filter((session) => session.date >= currentDate);

  // Séances à afficher en fonction de l'état showHistory
  const sessionsToDisplay = showHistory ? pastSessions : upcomingSessions;

  // Séances filtrées par date sélectionnée
  const filteredSessions = selectedDate
    ? sessionsToDisplay.filter((session) => session.date === selectedDate)
    : sessionsToDisplay;

  return (
    <ScrollView style={styles.container}>
      {/* Section Calendrier */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendrier</Text>
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={sessions.reduce((acc, session) => {
              acc[session.date] = { marked: true, dotColor: '#00b80e' };
              return acc;
            }, {} as { [key: string]: { marked: boolean; dotColor: string } })}
            theme={{
              todayTextColor: '#00b80e',
              selectedDayBackgroundColor: '#00b80e',
              arrowColor: '#00b80e',
              calendarBackground: '#1F1F1F',
              textSectionTitleColor: '#FFFFFF',
              dayTextColor: '#FFFFFF',
              monthTextColor: '#FFFFFF',
              textDisabledColor: '#555555',
            }}
          />
        </View>
      </View>

      {/* Section Ajouter une séance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter une séance</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add-circle" size={24} color="#00b80e" />
          <Text style={styles.addButtonText}>Ajouter une séance</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton pour basculer entre l'historique et les séances à venir */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.historyButtonText}>
          {showHistory ? 'Voir les séances à venir' : 'Voir l\'historique des séances'}
        </Text>
      </TouchableOpacity>

      {/* Section Historique des séances ou Séances à venir */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedDate
            ? `Séances du ${selectedDate}`
            : showHistory
            ? 'Historique des séances'
            : 'Séances à venir'}
        </Text>
        {filteredSessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <Text style={styles.sessionDate}>{session.date}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionDuration}>
              Durée : {Math.floor(session.duration / 3600)}h {Math.floor((session.duration % 3600) / 60)}min {session.duration % 60}s
            </Text>
            <Text style={styles.sessionExercises}>
              Exercices : {session.exercises}
            </Text>
            <View style={styles.sessionActions}>
              <TouchableOpacity onPress={() => openEditModal(session)}>
                <Ionicons name="pencil" size={20} color="#00b80e" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteSession(session.id)}>
                <Ionicons name="trash" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
          
        ))}
      </View>

      

      {/* Modal pour ajouter/modifier une séance */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Modifier la séance' : 'Ajouter une séance'}
          </Text>

          {/* Sélecteur de date */}
          {Platform.OS === 'web' ? (
            <DatePicker
              selected={form.date ? new Date(form.date) : null}
              onChange={handleDateChangeWeb}
              dateFormat="yyyy-MM-dd"
              placeholderText="Sélectionner une date"
              className="date-picker"
              customInput={<input style={{ color: '#FFFFFF' }} />}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: '#FFFFFF' }}>{form.date || 'Sélectionner une date'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeMobile}
                  textColor="#FFFFFF"
                />
              )}
            </>
          )}

          {/* Sélecteur de type de sport */}
          <View style={styles.pickerContainers}>
            <RNPickerSelect
              onValueChange={handleTypeChange}
              items={sportTypes}
              placeholder={{ label: 'Sélectionner un type de sport', value: '' }}
              value={form.type}
              style={pickerSelectStyles}
              Icon={() => <Ionicons name="chevron-down" size={20} color="#00b80e" />}
            />
          </View>

          {/* Sélecteurs pour la durée (heures, minutes, secondes) */}
          <View style={styles.pickerRow}>
            {/* Sélecteur pour les heures */}
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    duration: {
                      ...prevForm.duration,
                      hours: parseInt(value, 10) || 0,
                    },
                  }))
                }
                items={Array.from({ length: 24 }, (_, i) => ({
                  label: `${i} h`,
                  value: i.toString(),
                }))}
                placeholder={{ label: '0 h', value: '0' }}
                value={form.duration.hours.toString()}
                style={pickerSelectStyles}
                Icon={() => <Ionicons name="chevron-down" size={20} color="#00b80e" />}
              />
            </View>

            {/* Sélecteur pour les minutes */}
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    duration: {
                      ...prevForm.duration,
                      minutes: parseInt(value, 10) || 0,
                    },
                  }))
                }
                items={Array.from({ length: 60 }, (_, i) => ({
                  label: `${i} min`,
                  value: i.toString(),
                }))}
                placeholder={{ label: '0 min', value: '0' }}
                value={form.duration.minutes.toString()}
                style={pickerSelectStyles}
                Icon={() => <Ionicons name="chevron-down" size={20} color="#00b80e" />}
              />
            </View>

            {/* Sélecteur pour les secondes */}
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    duration: {
                      ...prevForm.duration,
                      seconds: parseInt(value, 10) || 0,
                    },
                  }))
                }
                items={Array.from({ length: 60 }, (_, i) => ({
                  label: `${i} s`,
                  value: i.toString(),
                }))}
                placeholder={{ label: '0 s', value: '0' }}
                value={form.duration.seconds.toString()}
                style={pickerSelectStyles}
                Icon={() => <Ionicons name="chevron-down" size={20} color="#00b80e" />}
              />
            </View>
          </View>

          {/* Sélecteur d'exercices */}
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => setForm({ ...form, exercises: value || '' })}
              items={selectedExercises.map((exercise) => ({
                label: exercise,
                value: exercise,
              }))}
              placeholder={{ label: 'Sélectionner des exercices', value: '' }}
              value={form.exercises}
              style={pickerSelectStyles}
              Icon={() => <Ionicons name="chevron-down" size={20} color="#00b80e" />}
            />
          </View>

          <View style={styles.modalButtons}>
            <Button
              title={isEditing ? 'Modifier' : 'Ajouter'}
              onPress={isEditing ? handleEditSession : handleAddSession}
              color="#00b80e"
            />
            <Button
              title="Annuler"
              onPress={() => setModalVisible(false)}
              color="#ff4444"
            />
          </View>
        </View>
      </Modal>

      

      {/* Section Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>@Créé par Elmir Elias, Giovanni Mascaro, Ilyes Zekri</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1F1F1F',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 36,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#00b80e',
    borderRadius: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  historyButton: {
    backgroundColor: '#00b80e',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  historyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionType: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  sessionExercises: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 86,
    textAlign: 'center',
    color: '#FFFFFF',
    marginTop: 56,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00b80e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
    color: '#FFFFFF',
  },
  pickerContainers: {
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 220,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footer: {
    backgroundColor: '#1F1F1F',
    padding: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 84,
    borderTopWidth: 1,
    borderTopColor: '#00b80e',
  },
  footerText: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
});