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
  Pressable,
  Platform,
  StatusBar
} from 'react-native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
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
  avatar?: string;
};

// Types pour la navigation
type RootStackParamList = {
  ClientList: undefined;
  Messagerie: { clientId: number; clientName: string; clientAvatar?: string };
};

// Composant Liste des Clients
function ClientList({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'ClientList'> }) {
  const [clients, setClients] = useState<User[]>([]);
  const [filteredClients, setFilteredClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

        let clientsData: User[] = [];
        
        if (userData.role === 'admin') {
          const allUsersRes = await axios.get(`http://${IP}:5000/admin/users`);
          clientsData = allUsersRes.data.filter((user: User) => user.id !== userIdNum);
        } else if (userData.role === 'coach') {
          const clientsRes = await axios.get(`http://${IP}:5000/coach/clients/${id}`);
          clientsData = [...clientsRes.data, adminRes.data];
        } else if (userData.role === 'user') {
          const coachRes = await axios.get(`http://${IP}:5000/user/coach/${id}`);
          clientsData = [...(coachRes.data ? [coachRes.data] : []), adminRes.data];
        }

        // Ajouter des avatars par défaut si non fournis
        clientsData = clientsData.map(client => ({
          ...client,
          avatar: client.avatar || `https://ui-avatars.com/api/?name=${client.name}&background=random`
        }));

        setClients(clientsData);
        setFilteredClients(clientsData);

      } catch (error) {
        console.error('Failed to load clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const renderClient = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => navigation.navigate('Messagerie', { 
        clientId: item.id,
        clientName: item.name,
        clientAvatar: item.avatar
      })}
    >
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.clientAvatar}
      />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientUsername}>@{item.username}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.clientListContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          {userRole === 'admin' ? 'Messagerie Admin' : 
           userRole === 'coach' ? 'Mes Clients' : 
           userRole === 'user'  ? 'Messagerie' : 'Messagerie'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Feather name="x" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={50} color="#6C63FF" />
            <Text style={styles.emptyText}>
              {userRole === 'admin' ? 'Aucun utilisateur trouvé' : 
               userRole === 'coach' ? 'Aucun client assigné' : 'Aucun contact disponible'}
            </Text>
          </View>
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
  const { clientId, clientName, clientAvatar } = route.params;
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
  const [userAvatar, setUserAvatar] = useState<string>('https://ui-avatars.com/api/?name=User&background=random');
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
        setUserAvatar(userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=random`);

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
        setMessages(Array.isArray(res.data) ? res.data.reverse() : []);

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
          return [message, ...prev];
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
        aspect: [4, 3],
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
      const allowedReceivers = [];
      if (coachId) allowedReceivers.push(coachId);
      allowedReceivers.push(adminId);
      
      if (!allowedReceivers.includes(clientId)) {
        Alert.alert('Erreur', 'Vous ne pouvez pas envoyer de message à cette personne');
        return;
      }
    } else if (userRole === 'coach') {
      const clientsRes = await axios.get(`http://${IP}:5000/coach/clients/${userId}`);
      const clientIds = clientsRes.data.map((client: User) => client.id);
      clientIds.push(adminId);
      
      if (!clientIds.includes(clientId)) {
        Alert.alert('Erreur', 'Vous ne pouvez pas envoyer de message à cette personne');
        return;
      }
    }

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
        style={isSent ? styles.sentMessageContainer : styles.receivedMessageContainer}
      >
        {!isSent && (
          <Image 
            source={{ uri: clientAvatar || 'https://ui-avatars.com/api/?name=User&background=random' }} 
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isSent ? styles.sentMessageBubble : styles.receivedMessageBubble,
        ]}>
          {item.image_url && (
            item.image_url === 'uploading...' ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={isSent ? '#fff' : '#6C63FF'} />
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
            {isSent && (
              item.is_read ? (
                <Ionicons name="checkmark-done" size={14} color="#4CAF50" style={styles.readIcon} />
              ) : (
                <Ionicons name="checkmark" size={14} color="#888" style={styles.readIcon} />
              )
            )}
          </Text>
        </View>
        
        {isSent && (
          <Image 
            source={{ uri: userAvatar }} 
            style={styles.messageAvatar}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.messagerieContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#6C63FF" />
      
      <View style={styles.messagerieHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: clientAvatar || 'https://ui-avatars.com/api/?name=User&background=random' }} 
          style={styles.headerAvatar}
        />
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {userRole === 'admin' ? clientName : 
             userRole === 'coach' ? (clientId === adminId ? 'Admin' : clientName) : 
             (clientId === adminId ? 'Admin' : clientName)}
          </Text>
          <Text style={styles.headerStatus}>En ligne</Text>
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="more-vertical" size={20} color="#fff" />
        </TouchableOpacity>
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
            <Feather name="message-square" size={50} color="#6C63FF" />
            <Text style={styles.emptyListText}>Aucun message échangé</Text>
            <Text style={styles.emptyListSubText}>Envoyez votre premier message</Text>
          </View>
        }
      />

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setImage(null)}
          >
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.attachmentButton}>
          <Feather name="paperclip" size={24} color="#6C63FF" />
        </TouchableOpacity>

        <TextInput
          style={styles.messageInput}
          placeholder="Écrivez un message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />

        <TouchableOpacity 
          style={[styles.sendButton, (!newMessage.trim() && !image) && styles.disabledButton]} 
          onPress={sendMessage}
          disabled={!newMessage.trim() && !image}
        >
          <Feather name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {editMode ? (
              <>
                <Text style={styles.modalTitle}>Modifier le message</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedMessage}
                  onChangeText={setEditedMessage}
                  multiline
                  autoFocus
                  placeholderTextColor="#888"
                />
                <View style={styles.modalButtonContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={updateMessage}
                  >
                    <Text style={styles.modalButtonText}>Enregistrer</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Options du message</Text>
                <View style={styles.modalButtonContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.editButton]}
                    onPress={() => setEditMode(true)}
                  >
                    <Feather name="edit" size={18} color="#fff" />
                    <Text style={styles.modalButtonText}>Modifier</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={deleteMessage}
                  >
                    <Feather name="trash-2" size={18} color="#fff" />
                    <Text style={styles.modalButtonText}>Supprimer</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton, { marginTop: 10 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#333' }]}>Annuler</Text>
                </Pressable>
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
    backgroundColor: '#1F1F1F',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#1F1F1F',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#333',
    fontSize: 16,
  },
  clearSearch: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  clientUsername: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 15,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  // Messagerie Styles
  messagerieContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  messagerieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6C63FF',
    elevation: 5,
  },
  backButton: {
    marginRight: 15,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerButton: {
    padding: 5,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  sentMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  receivedMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  sentMessageBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 0,
  },
  receivedMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sentMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  receivedMessageText: {
    color: '#333',
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  uploadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    marginBottom: 8,
  },
  uploadingText: {
    marginTop: 8,
    color: '#666',
  },
  sentTimestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
    marginTop: 3,
  },
  receivedTimestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 3,
  },
  readIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachmentButton: {
    padding: 10,
    marginRight: 5,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  imagePreview: {
    position: 'relative',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyListText: {
    fontSize: 18,
    color: '#6C63FF',
    marginTop: 15,
    fontWeight: '500',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  editInput: {
    height: 100,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
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
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});