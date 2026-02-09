import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";

export default function HomeScreen({ navigation }) {
  const { user, setUser } = useContext(AppContext); // Agregamos setUser
  const [search, setSearch] = useState("");

  // --- NUEVOS ESTADOS PARA EL BUSCADOR ---
  const [modalVisible, setModalVisible] = useState(false);
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(false);

  // --- LÓGICA DE BÚSQUEDA ---
  const buscarArticulo = () => {
    if (!search.trim()) return;

    setCargando(true);
    setModalVisible(true);

    // Simulación de consulta a BD (Esto luego será tu fetch a PHP)
    setTimeout(() => {
      const dbSimulada = [
        {
          codigo: "MX-100",
          descripcion: "Taladro Inalámbrico Pro",
          foto: "https://www.stayer.es/wp-content/uploads/taladro-electrico-cable.jpeg",
          ficha:
            "Potencia: 20V\nVelocidad: 1500 RPM\nBatería: Litio 2.0 Ah\nUso: Industrial",
        },
      ];

      const encontrado = dbSimulada.find(
        (a) => a.codigo.toUpperCase() === search.toUpperCase()
      );

      setArticulo(encontrado || null);
      setCargando(false);
    }, 800);
  };

  const menuItems = [
    {
      id: "1",
      title: "Almacén",
      icon: "warehouse",
      color: "#4a302a",
    },
    { id: "2", title: "Logistica", icon: "truck-delivery", color: "#1e3a5a" },
    { id: "3", title: "Ventas", icon: "cart-outline", color: "#2d4a3e" },
    {
      id: "4",
      title: "Cirugías",
      icon: "check-decagram-outline",
      color: "#1e3a5a",
    },
    /*{
      id: "5",
      title: "Reportes",
      icon: "file-chart-outline",
      color: "#1e3a5a",
    },
    {
      id: "6",
      title: "Configurar",
      icon: "plus",
      color: "transparent",
      border: true,
    },*/
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tile,
        { backgroundColor: item.color },
        item.border && styles.tileBorder,
      ]}
      onPress={() => {
        if (item.id === "1") {
          navigation.navigate("Almacen");
        } else {
          console.log(`Próximamente: ${item.title}`);
        }
      }}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={32}
        color={item.border ? "#3182ce" : "white"}
      />
      <Text style={[styles.tileText, item.border && { color: "#3182ce" }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
const cerrarSesion = () => {
  const mensaje = "¿Estás seguro de que quieres salir?";
  
  if (Platform.OS === 'web') {
    // Si es web usamos el confirm estándar del navegador
    if (window.confirm(mensaje)) {
      setUser(null);
      navigation.replace("Login");
    }
  } else {
    // Si es móvil usamos el Alert estético de React Native
    Alert.alert(
      "Cerrar Sesión",
      mensaje,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, salir", 
          onPress: () => {
            setUser(null);
            navigation.replace("Login");
          } 
        }
      ]
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. BUSCADOR SUPERIOR */}
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color="#ccc"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            //onSubmitEditing={buscarArticulo} // Buscar al dar "Enter" en teclado
          />
          <MaterialCommunityIcons name="barcode-scan" size={24} color="#ccc" />
        </View>
      </View>

      {/* 2. CUADRÍCULA CENTRAL */}
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {/* 3. MODAL DE RESULTADO DE BÚSQUEDA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalResultContent}>
            {cargando ? (
              <ActivityIndicator size="large" color="#3182ce" />
            ) : articulo ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalArtTitle}>Detalle de Artículo</Text>

                <Image
                  source={{ uri: articulo.foto }}
                  style={styles.artImage}
                />

                <View style={styles.artInfoBox}>
                  <Text style={styles.artLabel}>CÓDIGO</Text>
                  <Text style={styles.artValue}>{articulo.codigo}</Text>

                  <Text style={[styles.artLabel, { marginTop: 10 }]}>
                    DESCRIPCIÓN
                  </Text>
                  <Text style={styles.artValue}>{articulo.descripcion}</Text>
                </View>

                <View style={styles.artFichaBox}>
                  <Text style={styles.artFichaLabel}>Ficha Técnica</Text>
                  <Text style={styles.artFichaText}>{articulo.ficha}</Text>
                </View>
              </ScrollView>
            ) : (
              <View style={{ alignItems: "center", padding: 20 }}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={70}
                  color="#f56565"
                />
                <Text style={styles.errorText}>Artículo no encontrado</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.btnCloseModal}
              onPress={() => {
                setModalVisible(false);
                setArticulo(null);
                setSearch("");
              }}
            >
              <Text style={styles.btnCloseText}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. MENÚ INFERIOR */}
      <View style={styles.bottomNav}>
        {/* Modificamos esta parte */}
        <TouchableOpacity style={styles.navLeft} onPress={cerrarSesion}>
          <MaterialCommunityIcons name="logout" size={28} color="#f56565" />
          <Text style={[styles.navText, { color: "#f56565" }]}>Salir</Text>
        </TouchableOpacity>

        <View style={styles.navRight}>
          <Text style={styles.navUser}>{user?.nombre || "Usuario"}</Text>
          <View style={styles.statusDot} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212",paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: { padding: 20, paddingTop: 10 },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    alignItems: "center",
  },
  searchInput: { flex: 1, color: "white", fontSize: 16 },
  grid: { paddingHorizontal: 10, paddingBottom: 20 },
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 12,
    padding: 15,
    justifyContent: "flex-end",
  },
  tileBorder: {
    borderWidth: 2,
    borderColor: "#1e3a5a",
    justifyContent: "center",
    alignItems: "center",
  },
  tileText: { color: "white", fontSize: 16, fontWeight: "500", marginTop: 10 },
  bottomNav: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  navLeft: { flexDirection: "row", alignItems: "center" },
  navText: { color: "white", marginLeft: 10, fontSize: 16 },
  navRight: { flexDirection: "row", alignItems: "center" },
  navUser: { color: "white", marginRight: 10, fontSize: 16 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#48bb78",
  },

  // ESTILOS DEL MODAL DE BÚSQUEDA
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalResultContent: {
    backgroundColor: "#1e1e1e",
    width: "90%",
    borderRadius: 20,
    padding: 25,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalArtTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  artImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "contain",
  },
  artInfoBox: { marginBottom: 20 },
  artLabel: {
    color: "#3182ce",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  artValue: { color: "white", fontSize: 18, marginTop: 4 },
  artFichaBox: {
    backgroundColor: "#121212",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  artFichaLabel: { color: "#48bb78", fontWeight: "bold", marginBottom: 8 },
  artFichaText: { color: "#bbb", fontSize: 14, lineHeight: 20 },
  errorText: {
    color: "#f56565",
    fontSize: 20,
    marginTop: 15,
    fontWeight: "bold",
  },
  btnCloseModal: {
    backgroundColor: "#3182ce",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  btnCloseText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
