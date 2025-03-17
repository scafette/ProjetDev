import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Modal, Button, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // Pour mobile
import 'react-datepicker/dist/react-datepicker.css'; // Pour le web
import DatePicker from 'react-datepicker'; // Pour le web
import RNPickerSelect from 'react-native-picker-select';

// Types de sports disponibles
const sportTypes = [
  { label: 'Course à pied', value: 'Course à pied' },
  { label: 'Cyclisme', value: 'Cyclisme' },
  { label: 'Natation', value: 'Natation' },
  { label: 'Musculation', value: 'Musculation' },
  { label: 'Yoga', value: 'Yoga' },
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

// Types pour les séances et les objectifs
type Session = {
  id: string;
  date: string;
  type: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  exercises: string[];
};

type Goal = {
  id: string;
  description: string;
  completed: boolean;
};

export default function PlanningScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
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

  const handleAddSession = () => {
    if (!form.date || !form.type || !form.exercises) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    const newSession: Session = {
      id: Math.random().toString(),
      date: form.date,
      type: form.type,
      duration: form.duration,
      exercises: form.exercises.split(','),
    };
    setSessions([...sessions, newSession]);
    setForm({ date: '', type: '', duration: { hours: 0, minutes: 0, seconds: 0 }, exercises: '' });
    setModalVisible(false);
  };

  const handleEditSession = () => {
    if (selectedSession) {
      const updatedSessions = sessions.map((session) =>
        session.id === selectedSession.id
          ? {
              ...session,
              date: form.date,
              type: form.type,
              duration: form.duration,
              exercises: form.exercises.split(','),
            }
          : session
      );
      setSessions(updatedSessions);
      setModalVisible(false);
      setSelectedSession(null);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((session) => session.id !== id));
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Math.random().toString(),
      description: 'Nouvel objectif',
      completed: false,
    };
    setGoals([...goals, newGoal]);
  };

  const handleToggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const openEditModal = (session: Session) => {
    setSelectedSession(session);
    setForm({
      date: session.date,
      type: session.type,
      duration: session.duration,
      exercises: session.exercises.join(','),
    });
    setIsEditing(true);
    setModalVisible(true);
  };

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

  // Gestion du sélecteur de date pour le web
  const handleDateChangeWeb = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setForm({ ...form, date: formattedDate });
  };

  // Gestion du changement de type de sport
  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value || '', exercises: '' });
    setSelectedExercises(exercisesByType[value] || []);
  };

  // Filtrer les séances en fonction de la date actuelle
  const currentDate = new Date().toISOString().split('T')[0]; // Date actuelle au format YYYY-MM-DD
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
              Durée : {session.duration.hours}h {session.duration.minutes}min {session.duration.seconds}s
            </Text>
            <Text style={styles.sessionExercises}>
              Exercices : {session.exercises.join(', ')}
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
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{form.date || 'Sélectionner une date'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChangeMobile}
                />
              )}
            </>
          )}

          {/* Sélecteur de type de sport */}
          <View style={styles.pickerContainer}>
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
                      hours: parseInt(value, 10) || 0, // Convertir en nombre
                    },
                  }))
                }
                items={Array.from({ length: 24 }, (_, i) => ({
                  label: `${i} h`,
                  value: i.toString(), // Convertir en chaîne
                }))}
                placeholder={{ label: '0 h', value: '0' }} // Valeur par défaut en chaîne
                value={form.duration.hours.toString()} // Convertir en chaîne
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
                      minutes: parseInt(value, 10) || 0, // Convertir en nombre
                    },
                  }))
                }
                items={Array.from({ length: 60 }, (_, i) => ({
                  label: `${i} min`,
                  value: i.toString(), // Convertir en chaîne
                }))}
                placeholder={{ label: '0 min', value: '0' }} // Valeur par défaut en chaîne
                value={form.duration.minutes.toString()} // Convertir en chaîne
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
                      seconds: parseInt(value, 10) || 0, // Convertir en nombre
                    },
                  }))
                }
                items={Array.from({ length: 60 }, (_, i) => ({
                  label: `${i} s`,
                  value: i.toString(), // Convertir en chaîne
                }))}
                placeholder={{ label: '0 s', value: '0' }} // Valeur par défaut en chaîne
                value={form.duration.seconds.toString()} // Convertir en chaîne
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
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
    marginBottom: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#00b80e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4, // Espacement entre les sélecteurs
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
});