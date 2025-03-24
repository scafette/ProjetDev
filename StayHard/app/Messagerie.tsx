import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Messagerie() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null); // Message sélectionné pour modification/suppression
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal pour la modification
  const [editedMessage, setEditedMessage] = useState(''); // Texte du message modifié

  // Récupérer l'ID de l'utilisateur et du coach
  useEffect(() => {
    const fetchUserAndCoach = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) {
        setUserId(parseInt(id, 10));
        try {
          const response = await axios.get(`http://192.168.1.166:5000/user/${id}`);
          setCoachId(response.data.coach_id || null);
        } catch (error) {
          console.error(error);
          Alert.alert('Erreur', 'Impossible de récupérer les informations du coach.');
        }
      }
    };
    fetchUserAndCoach();
  }, []);

  // Récupérer les messages
  useEffect(() => {
    if (userId && coachId) {
      fetchMessages();
    }
  }, [userId, coachId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.166:5000/messages/${userId}/${coachId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de récupérer les messages.');
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Erreur', 'Le message ne peut pas être vide.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.166:5000/messages', {
        sender_id: userId,
        receiver_id: coachId,
        message: newMessage,
      });

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
      await fetchMessages(); // Rafraîchir la liste des messages
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    }
  };

  // Modifier un message
  const updateMessage = async () => {
    if (!editedMessage.trim()) {
      Alert.alert('Erreur', 'Le message ne peut pas être vide.');
      return;
    }

    try {
      await axios.put(`http://192.168.1.166:5000/messages/${selectedMessage.id}`, {
        message: editedMessage,
      });

      setEditModalVisible(false); // Fermer le modal
      await fetchMessages(); // Rafraîchir la liste des messages
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de modifier le message.');
    }
  };

  // Supprimer un message
  const deleteMessage = async () => {
    try {
      await axios.delete(`http://192.168.1.166:5000/messages/${selectedMessage.id}`);
      setEditModalVisible(false); // Fermer le modal
      await fetchMessages(); // Rafraîchir la liste des messages
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de supprimer le message.');
    }
  };

  // Afficher un message
  const renderMessage = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        onLongPress={() => {
          setSelectedMessage(item);
          setEditModalVisible(true);
          setEditedMessage(item.message);
        }}
      >
        <View
          style={[
            styles.messageContainer,
            item.sender_id === userId ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Filtrer les messages invalides
  const validMessages = messages.filter((item) => item && item.id);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={validMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour modifier/supprimer un message */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.editInput}
              value={editedMessage}
              onChangeText={setEditedMessage}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={updateMessage}>
                <Text style={styles.modalButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={deleteMessage}>
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  editInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});