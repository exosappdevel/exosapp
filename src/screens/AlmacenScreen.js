import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import CustomModal from "../components/CustomModal";

export default function AlmacenScreen({ navigation }) {
  const { user } = useContext(AppContext);
  const [modalAviso, setModalAviso] = useState({ visible: false, titulo: "", mensaje: "", icon: "lock" });

  const menuItems = [
    { id: "1", title: "Pickeo", icon: "cart-arrow-right", color: "#4a302a" },
    { id: "2", title: "Inventario", icon: "format-list-checks", color: "#1e3a5a" },
    { id: "4", title: "Entradas", icon: "home-import-outline", color: "#1e3a5a" },
    { id: "5", title: "Salidas", icon: "home-export-outline", color: "#1e3a5a" },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: item.color }]}
      onPress={() => {
        if (item.id === "1") {
          navigation.navigate("Terminales");
        } else {
          setModalAviso({
            visible: true,
            titulo: "Módulo Bloqueado",
            mensaje: `El acceso a ${item.title} no está habilitado actualmente.`,
            icon: "lock-outline"
          });
        }
      }}
    >
      <MaterialCommunityIcons name={item.icon} size={32} color="white" />
      <Text style={styles.tileText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Almacén</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      <CustomModal 
        visible={modalAviso.visible}
        titulo={modalAviso.titulo}
        mensaje={modalAviso.mensaje}
        icon={modalAviso.icon}
        onClose={() => setModalAviso({ ...modalAviso, visible: false })}
      />

      <View style={styles.bottomNav}>
        <Text style={styles.navUser}>{user?.nombre || "Usuario"}</Text>
        <View style={styles.statusDot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  grid: { paddingHorizontal: 10, paddingVertical: 10 },
  tile: { flex: 1, aspectRatio: 1, margin: 8, borderRadius: 12, padding: 15, justifyContent: "flex-end" },
  tileText: { color: "white", fontSize: 16, fontWeight: "500", marginTop: 10 },
  bottomNav: { height: 60, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "#333" },
  navUser: { color: "white", marginRight: 10, fontSize: 14 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#48bb78" },
});