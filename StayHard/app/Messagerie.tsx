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
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';

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

export default function Messagerie() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const [coachId, setCoachId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const socket = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const setupSocket = async () => {
      try {
        socket.current = io('ws://192.168.1.166:5000', {
          transports: ['websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          if (userId) {
            socket.current?.emit('userConnected', userId);
          }
        });

        socket.current.on('newMessage', (message: Message) => {
          setMessages(prev => {
            const exists = prev.some(m => m.id === message.id);
            if (!exists) {
              return [message, ...prev];
            }
            return prev;
          });
        });

        socket.current.on('deleteMessage', (messageId: number) => {
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
        });

        socket.current.on('updateMessage', (updatedMessage: Message) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        });

        socket.current.on('onlineUsers', (users: number[]) => {
          setOnlineUsers(users);
        });

      } catch (err) {
        console.error('Socket setup error:', err);
      }
    };

    setupSocket();

    return () => {
      socket.current?.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) return;

        const userIdNum = parseInt(id, 10);
        setUserId(userIdNum);

        const userRes = await axios.get(`http://192.168.1.166:5000/user/${id}`);
        const userData = userRes.data;
        
        setUserRole(userData.role);

        if (userData.role === 'user' || userData.role === 'admin') {
          if (userData.coach_id) {
            setCoachId(userData.coach_id);
            loadMessages(userIdNum, userData.coach_id);
          }
        } else if (userData.role === 'coach') {
          const clientsRes = await axios.get(`http://192.168.1.166:5000/coach/clients/${id}`);
          setClients(clientsRes.data);
          if (clientsRes.data.length > 0) {
            setSelectedClient(clientsRes.data[0].id);
            loadMessages(clientsRes.data[0].id, userIdNum);
          }
        }

        if (socket.current?.connected && userIdNum) {
          socket.current.emit('userConnected', userIdNum);
        }

      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const loadMessages = async (senderId: number, receiverId: number) => {
    try {
      const res = await axios.get(
        `http://192.168.1.166:5000/messages/${senderId}/${receiverId}`
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  const handleClientChange = async (clientId: number) => {
    if (!userId) return;
    setSelectedClient(clientId);
    loadMessages(clientId, userId);
  };

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
    if (!userId) return;

    const receiverId = userRole === 'coach' ? selectedClient : coachId;
    if (!receiverId) return;

    let tempMessage: Message | null = null;

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
          'http://192.168.1.166:5000/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        imageUrl = uploadRes.data.filepath;
      }

      tempMessage = {
        id: Date.now(),
        sender_id: userId,
        receiver_id: receiverId,
        message: newMessage,
        image_url: imageUrl || undefined,
        is_read: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [tempMessage!, ...prev]);
      setNewMessage('');
      setImage(null);

      if (socket.current?.connected) {
        socket.current.emit('sendMessage', tempMessage, (ack: any) => {
          if (ack?.status === 'received' && ack?.message) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === tempMessage!.id ? { ...ack.message, id: ack.message.id } : msg
              )
            );
          }
        });
      } else {
        const response = await axios.post('http://192.168.1.166:5000/messages', tempMessage);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage!.id ? response.data : msg
          )
        );
      }

    } catch (error) {
      console.error('Send message error:', error);
      if (tempMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage!.id));
      }
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
      await axios.delete(`http://192.168.1.166:5000/messages/${selectedMessage.id}`);
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setModalVisible(false);
      
      if (socket.current?.connected) {
        socket.current.emit('deleteMessage', selectedMessage.id);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      Alert.alert('Erreur', 'Échec de la suppression du message');
    }
  };

  const updateMessage = async () => {
    if (!selectedMessage || !editedMessage.trim()) return;
    
    try {
      const updatedMessage = {
        ...selectedMessage,
        message: editedMessage
      };

      const response = await axios.put(
        `http://192.168.1.166:5000/messages/${selectedMessage.id}`,
        { message: editedMessage }
      );

      setMessages(prev => 
        prev.map(msg => 
          msg.id === selectedMessage.id ? response.data : msg
        )
      );
      
      if (socket.current?.connected) {
        socket.current.emit('updateMessage', response.data);
      }
      
      setModalVisible(false);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update message:', error);
      Alert.alert('Erreur', 'Échec de la modification du message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item) return null;
    
    const isSent = item.sender_id === userId;
    const isOnline = onlineUsers.includes(item.sender_id);

    return (
      <TouchableOpacity 
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.messageContainer,
          isSent ? styles.sentMessage : styles.receivedMessage,
          !item.is_read && !isSent && styles.unreadMessage
        ]}>
          {item.image_url && (
            <Image
              source={{ uri: `http://192.168.1.166:5000/${item.image_url}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          {item.message && <Text style={isSent ? styles.sentMessageText : styles.receivedMessageText}>
            {item.message}
          </Text>}
          <View style={styles.messageFooter}>
            <Text style={isSent ? styles.sentTimestamp : styles.receivedTimestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isOnline && !isSent && <View style={styles.onlineIndicator} />}
          </View>
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
      {userRole === 'coach' && clients.length > 0 && (
        <View style={styles.clientSelector}>
          <Picker
            selectedValue={selectedClient?.toString()}
            onValueChange={(itemValue) => handleClientChange(Number(itemValue))}
            style={styles.picker}
          >
            {clients.map(client => (
              <Picker.Item
                key={client.id.toString()}
                label={`${client.name} ${onlineUsers.includes(client.id) ? '🟢' : '⚪'}`}
                value={client.id.toString()}
              />
            ))}
          </Picker>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => {
          if (!item) return Math.random().toString();
          if (item.id) return item.id.toString();
          return Math.random().toString();
        }}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        onLayout={() => listRef.current?.scrollToEnd({animated: true})}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>Aucun message à afficher</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientSelector: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  picker: {
    height: 50,
    width: '100%',
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
  unreadMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  sentTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTimestamp: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginLeft: 5,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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