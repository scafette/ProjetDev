import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable
} from 'react-native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
const IP = "172.20.10.6";

// Types
type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
  is_read: boolean;
  image_url?: string;
};

type User = {
  id: number;
  name: string;
  username: string;
};

// Types pour la navigation
type RootStackParamList = {
  ClientList: undefined;
  Messagerie: { clientId: number; clientName: string };
};

// Composant Liste des Clients
function ClientList({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'ClientList'> }) {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) return;

        const userIdNum = parseInt(id, 10);
        setUserId(userIdNum);

        const userRes = await axios.get(`http://${IP}:5000/user/${id}`);
        const userData = userRes.data;
        setUserRole(userData.role);

        // Charger l'admin pour tous les rôles
        const adminRes = await axios.get(`http://${IP}:5000/users/admin`);
        setAdminId(adminRes.data.id);

        if (userData.role === 'admin') {
          const allUsersRes = await axios.get(`http://${IP}:5000/admin/users`);
          setClients(allUsersRes.data.filter((user: User) => user.id !== userIdNum));
        } else if (userData.role === 'coach') {
          const clientsRes = await axios.get(`http://${IP}:5000/coach/clients/${id}`);
          setClients([...clientsRes.data, adminRes.data]);
        } else if (userData.role === 'user') {
          const coachRes = await axios.get(`http://${IP}:5000/user/coach/${id}`);
          setClients([...(coachRes.data ? [coachRes.data] : []), adminRes.data]);
        }

      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const renderClient = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => navigation.navigate('Messagerie', { 
        clientId: item.id,
        clientName: item.name 
      })}
    >
      <Text style={styles.clientName}>{item.name}</Text>
      <Text style={styles.clientUsername}>@{item.username}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.clientListContainer}>
      <Text style={styles.title}>
        {userRole === 'admin' ? 'Messagerie Admin' : 
         userRole === 'coach' ? 'Mes Clients' : 
         userRole === 'user'  ? 'Messagerie' : 'Messagerie'}
      </Text>
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {userRole === 'admin' ? 'Aucun utilisateur' : 
             userRole === 'coach' ? 'Aucun client assigné' : 'Aucun contact disponible'}
          </Text>
        }
      />
    </View>
  );
}

// Composant Messagerie
function MessagerieScreen({ route, navigation }: { 
  route: RouteProp<RootStackParamList, 'Messagerie'>,
  navigation: StackNavigationProp<RootStackParamList, 'Messagerie'>
}) {
  const { clientId, clientName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const socket = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) return;

        const userIdNum = parseInt(id, 10);
        setUserId(userIdNum);

        const userRes = await axios.get(`http://${IP}:5000/user/${id}`);
        const userData = userRes.data;
        setUserRole(userData.role);

        // Charger l'admin ID pour tous les utilisateurs
        const adminRes = await axios.get(`http://${IP}:5000/users/admin`);
        setAdminId(adminRes.data.id);

        if (userData.role === 'user') {
          const coachRes = await axios.get(`http://${IP}:5000/user/coach/${id}`);
          if (coachRes.data) {
            setCoachId(coachRes.data.id);
          }
        }

        const res = await axios.get(`http://${IP}:5000/messages/${userIdNum}/${clientId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);

      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Configuration du socket
    socket.current = io(`ws://${IP}:5000`, { transports: ['websocket'] });

    socket.current.on('connect', () => console.log('Socket connected'));
    socket.current.on('disconnect', () => console.log('Socket disconnected'));

    socket.current.on('newMessage', (message: Message) => {
      setMessages(prev => {
        if (!prev.some(msg => msg.id === message.id)) {
          return [...prev, message];
        }
        return prev;
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socket.current.on('deleteMessage', (messageId: number) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    socket.current.on('updateMessage', (updatedMessage: Message) => {
      setMessages(prev => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [clientId]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !image) return;
    if (!userId || !userRole || !adminId) return;

    if (userRole === 'user') {
      // User peut parler à son coach ET à l'admin obligatoirement
      const allowedReceivers = [];
      if (coachId) allowedReceivers.push(coachId);
      allowedReceivers.push(adminId);
      
      if (!allowedReceivers.includes(clientId)) {
        Alert.alert('Erreur', 'Vous ne pouvez pas envoyer de message à cette personne');
        return;
      }
    } else if (userRole === 'coach') {
      // Coach peut parler à ses clients ET à l'admin
      const clientsRes = await axios.get(`http://${IP}:5000/coach/clients/${userId}`);
      const clientIds = clientsRes.data.map((client: User) => client.id);
      clientIds.push(adminId);
      
      if (!clientIds.includes(clientId)) {
        Alert.alert('Erreur', 'Vous ne pouvez pas envoyer de message à cette personne');
        return;
      }
    }
    // Admin n'a pas de restriction

    const tempId = Date.now();
    const tempMessage: Message = {
      id: tempId,
      sender_id: userId,
      receiver_id: clientId,
      message: newMessage,
      image_url: image ? 'uploading...' : undefined,
      is_read: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [tempMessage, ...prev]);
    setNewMessage('');
    setImage(null);

    try {
      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append('file', {
          uri: image,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
        formData.append('user_id', userId.toString());

        const uploadRes = await axios.post(
          `http://${IP}:5000/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        imageUrl = uploadRes.data.filepath;
      }

      const finalMessage = {
        ...tempMessage,
        image_url: imageUrl || undefined
      };

      if (socket.current?.connected) {
        socket.current.emit('sendMessage', finalMessage);
      } else {
        await axios.post(`http://${IP}:5000/messages`, finalMessage);
      }

      setMessages(prev => prev.map(msg => msg.id === tempId ? finalMessage : msg));

    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      Alert.alert("Erreur", "Échec d'envoi du message");
    }
  };

  const handleLongPress = (message: Message) => {
    if (message.sender_id === userId) {
      setSelectedMessage(message);
      setEditedMessage(message.message);
      setModalVisible(true);
    }
  };

  const deleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      await axios.delete(`http://${IP}:5000/messages/${selectedMessage.id}`);
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      
      if (socket.current?.connected) {
        socket.current.emit('deleteMessage', selectedMessage.id);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la suppression');
    } finally {
      setModalVisible(false);
    }
  };

  const updateMessage = async () => {
    if (!selectedMessage || !editedMessage.trim()) return;
    
    try {
      const response = await axios.put(
        `http://${IP}:5000/messages/${selectedMessage.id}`,
        { message: editedMessage }
      );

      setMessages(prev => prev.map(msg => msg.id === selectedMessage.id ? response.data : msg));
      
      if (socket.current?.connected) {
        socket.current.emit('updateMessage', response.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la modification');
    } finally {
      setModalVisible(false);
      setEditMode(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.sender_id === userId;

    return (
      <TouchableOpacity 
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.messageContainer,
          isSent ? styles.sentMessage : styles.receivedMessage,
        ]}>
          {item.image_url && (
            item.image_url === 'uploading...' ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={isSent ? '#fff' : '#007bff'} />
                <Text style={[styles.uploadingText, isSent && { color: '#fff' }]}>
                  Envoi en cours...
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: `http://${IP}:5000/${item.image_url}` }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )
          )}
          {item.message && (
            <Text style={isSent ? styles.sentMessageText : styles.receivedMessageText}>
              {item.message}
            </Text>
          )}
          <Text style={isSent ? styles.sentTimestamp : styles.receivedTimestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.clientHeader}>
          {userRole === 'admin' ? `Conversation avec ${clientName}` : 
           userRole === 'coach' ? (clientId === adminId ? 'Admin' : clientName) : 
           (clientId === adminId ? 'Admin' : clientName)}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        onLayout={() => listRef.current?.scrollToEnd({animated: true})}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>Aucun message échangé</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />

        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={!newMessage.trim() && !image}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.removeImageText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {editMode ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editedMessage}
                  onChangeText={setEditedMessage}
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={updateMessage}
                  >
                    <Text style={styles.modalButtonText}>Enregistrer</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalText}>Que voulez-vous faire avec ce message?</Text>
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => setEditMode(true)}
                  >
                    <Text style={styles.modalButtonText}>Modifier</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={deleteMessage}
                  >
                    <Text style={styles.modalButtonText}>Supprimer</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

export default function MessagerieStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientList" component={ClientList} />
      <Stack.Screen name="Messagerie" component={MessagerieScreen} />
    </Stack.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  clientListContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  clientItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clientUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    fontSize: 24,
    marginRight: 15,
  },
  clientHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderTopRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9e9eb',
    borderTopLeftRadius: 0,
  },
  sentMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  receivedMessageText: {
    color: '#000',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadingText: {
    marginTop: 8,
    color: '#666',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  sentTimestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  receivedTimestamp: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    fontSize: 16,
  },
  uploadButton: {
    padding: 10,
  },
  uploadButtonText: {
    fontSize: 24,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    margin: 5,
    minWidth: 80,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#cccccc',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editInput: {
    height: 100,
    width: '100%',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
  },
});