import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";

const NotificationsPage = () => {
  // État pour stocker les notifications
  const [notifications, setNotifications] = useState([
    { id: "1", text: "Notification 1", pinned: false },
    { id: "2", text: "Notification 2", pinned: false },
    { id: "3", text: "Notification 3", pinned: false },
  ]);

  // État pour le rafraîchissement
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour supprimer une notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Fonction pour épingler une notification
  const togglePinNotification = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, pinned: !notif.pinned } : notif
      )
    );
  };

// Fonction pour rafraîchir la page
const onRefresh = () => {
    setRefreshing(true);
    // Simuler un chargement asynchrone
    setTimeout(() => {
        setNotifications([
            { id: "4", text: "Nouvelle Notification", pinned: false },
            ...notifications,
        ]);
        setRefreshing(false);
    }, 1000);
};

// Fonction pour le bouton de rafraîchissement
const RefreshButton = () => (
    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>🔄</Text>
    </TouchableOpacity>
);

  // Fonction pour rendre chaque élément de la liste
  const renderNotification = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      )}
    >
      <Animated.View
        style={styles.notificationItem}
        entering={FadeIn}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Text style={styles.notificationText}>{item.text}</Text>
        <TouchableOpacity onPress={() => togglePinNotification(item.id)}>
          <Text style={styles.pinButton}>
            {item.pinned ? "Désépingler" : "Épingler"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))}        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#f5f5f5",
    },
    notificationItem: {
      backgroundColor: "#fff",
      padding: 16,
      marginVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    notificationText: {
      fontSize: 16,
    },
    deleteButton: {
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      width: 100,
      height: "100%",
      borderRadius: 8,
    },
    deleteButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    pinButton: {
      color: "#007bff",
      fontWeight: "bold",
    },
    refreshButton: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
    },
    refreshButtonText: {
      // Ajoute les styles pour le texte du bouton de rafraîchissement ici
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default NotificationsPage;