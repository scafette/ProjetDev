import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Installer react-native-calendars
import { Ionicons } from '@expo/vector-icons';

type Session = {
  id: string;
  date: string;
  type: string;
  duration: string;
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
    duration: '',
    exercises: '',
  });

  const handleAddSession = () => {
    const newSession: Session = {
      id: Math.random().toString(),
      date: form.date,
      type: form.type,
      duration: form.duration,
      exercises: form.exercises.split(','),
    };
    setSessions([...sessions, newSession]);
    setForm({ date: '', type: '', duration: '', exercises: '' });
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
    setForm({ date: '', type: '', duration: '', exercises: '' });
    setIsEditing(false);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section Calendrier */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendrier</Text>
        <Calendar
          markedDates={sessions.reduce((acc, session) => {
            acc[session.date] = { marked: true, dotColor: '#00b80e' };
            return acc;
          }, {} as { [key: string]: { marked: boolean; dotColor: string } })}
          theme={{
            todayTextColor: '#00b80e',
            selectedDayBackgroundColor: '#00b80e',
            arrowColor: '#00b80e',
          }}
        />
      </View>

      {/* Section Ajouter une séance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajouter une séance</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add-circle" size={24} color="#00b80e" />
          <Text style={styles.addButtonText}>Ajouter une séance</Text>
        </TouchableOpacity>
      </View>

      {/* Section Historique des séances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des séances</Text>
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <Text style={styles.sessionDate}>{session.date}</Text>
            <Text style={styles.sessionType}>{session.type}</Text>
            <Text style={styles.sessionDuration}>Durée : {session.duration}</Text>
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

      {/* Section Objectifs sportifs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objectifs sportifs</Text>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <TouchableOpacity onPress={() => handleToggleGoal(goal.id)}>
              <Ionicons
                name={goal.completed ? 'checkbox' : 'square-outline'}
                size={20}
                color="#00b80e"
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.goalText,
                goal.completed && styles.goalCompleted,
              ]}
            >
              {goal.description}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Ionicons name="add-circle" size={24} color="#00b80e" />
          <Text style={styles.addButtonText}>Ajouter un objectif</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour ajouter/modifier une séance */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Modifier la séance' : 'Ajouter une séance'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={form.date}
            onChangeText={(text) => setForm({ ...form, date: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Type de sport"
            value={form.type}
            onChangeText={(text) => setForm({ ...form, type: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Durée (ex: 1h30)"
            value={form.duration}
            onChangeText={(text) => setForm({ ...form, duration: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Exercices (séparés par des virgules)"
            value={form.exercises}
            onChangeText={(text) => setForm({ ...form, exercises: text })}
          />
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
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1D3D47',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1D3D47',
  },
  sessionCard: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D3D47',
  },
  sessionType: {
    fontSize: 14,
    color: '#808080',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#808080',
  },
  sessionExercises: {
    fontSize: 14,
    color: '#808080',
  },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1D3D47',
  },
  goalCompleted: {
    textDecorationLine: 'line-through',
    color: '#808080',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});