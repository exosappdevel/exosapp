import React, { useContext, useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  Alert, 
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import CustomModal from "../components/CustomModal";

export default function AlmacenScreen({ navigation }) {
  const { user, setUser, theme } = useContext(AppContext);
  const [modalAviso, setModalAviso] = useState({ 
    visible: false, 
    titulo: "", 
    mensaje: "", 
    icon: "lock" 
  });

  // --- LÓGICA DE CIERRE DE SESIÓN ---
  const handleLogout = () => {
    const logoutAction = () => {
      setUser({ id: "", nombre: "", tema: user.tema });
      navigation.replace("Login");
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
      if (confirmar) logoutAction();
    } else {
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que deseas salir?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sí, salir", style: "destructive", onPress: logoutAction }
        ]
      );
    }
  };

  const menuItems = [
    { id: "1", title: "Pickeo", icon: "cart-arrow-right", color:  "#3182ce" },
    { id: "2", title: "Inventario", icon: "format-list-checks", color:"#ecc94b" },
    { id: "4", title: "Entradas", icon: "home-import-outline", color: "#48bb78" },
    { id: "5", title: "Salidas", icon: "home-export-outline", color: "#e53e3e" },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => {
        if (item.id === "1") {
          navigation.navigate("Terminales");
        } else {
          setModalAviso({
            visible: true,
            titulo: "Módulo Bloqueado",
            mensaje: `El acceso a ${item.title} requiere permisos de administrador.`,
            icon: "lock-alert"
          });
        }
      }}
    >
      <View style={[styles.iconBox, { backgroundColor:user.tema === 'dark' ? theme.card : `${item.color}20` ,color:user.tema === 'dark' ?`${item.color}`:theme.text}]}>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={user.tema === 'dark' ? "light-content" : "dark-content"} />
      
      {/* NAVBAR CON NOMBRE Y LOGOUT */}
      <View style={[styles.navbar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navText, { color: theme.text }]}>Almacén</Text>
        </View>

        <TouchableOpacity 
          style={styles.navRight} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={[styles.navUser, { color: theme.textSub }]}>{user?.nombre || "Usuario"}</Text>
          <MaterialCommunityIcons name="logout" size={22} color="#e53e3e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.header}>
            
          </View>
        }
      />

      <CustomModal 
        visible={modalAviso.visible}
        titulo={modalAviso.titulo}
        mensaje={modalAviso.mensaje}
        icon={modalAviso.icon}
        onClose={() => setModalAviso({ ...modalAviso, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    height: 60, 
    borderBottomWidth: 1 
  },
  navLeft: { flexDirection: "row", alignItems: "center" },
  navRight: { 
    flexDirection: "row", 
    alignItems: "center",
    padding: 5,
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto' 
  },
  backBtn: { marginRight: 15 },
  navText: { fontSize: 18, fontWeight: "bold" },
  navUser: { marginRight: 10, fontSize: 14, fontWeight: "600" },
  
  scrollContent: { padding: 10 },
  header: { padding: 10, marginBottom: 10, marginTop: 10 },
  welcome: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 5 },

  menuItem: { 
    flex: 1, 
    margin: 10, 
    padding: 25, 
    borderRadius: 24, 
    borderWidth: 1, 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: { 
    width: 65, 
    height: 65, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 15 
  },
  menuLabel: { fontSize: 16, fontWeight: "bold" }
});