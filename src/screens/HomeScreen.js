import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  Platform // <--- Añadimos Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import CustomModal from "../components/CustomModal";

export default function HomeScreen({ navigation }) {
  const { user, setUser, theme } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [modalAviso, setModalAviso] = useState({ visible: false, titulo: "", mensaje: "" });

  // --- FUNCIÓN DE LOGOUT COMPATIBLE CON WEB ---
  const handleLogout = () => {
    const logoutAction = () => {
      setUser({ id: "", nombre: "", tema: user.tema });
      navigation.replace("Login");
    };

    if (Platform.OS === 'web') {
      // En Web usamos el confirm nativo del navegador
      const confirmar = window.confirm("¿Estás seguro de que deseas salir?");
      if (confirmar) logoutAction();
    } else {
      // En Móvil usamos el Alert elegante de RN
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

  const buscarArticulo = () => {
    setModalAviso({ visible: true, titulo: "PROXIMAMENTE", mensaje: "Funcionalidad en desarrollo" });
    return;
    if (!search.trim()) return;
    setCargando(true);
    setModalVisible(true);
    setTimeout(() => {
      const dbSimulada = [{
        codigo: "MX-100",
        descripcion: "Taladro Inalámbrico Pro",
        foto: "https://www.stayer.es/wp-content/uploads/taladro-electrico.jpg",
        ubicacion: "Pasillo A - Estante 4",
        stock: 45
      }];
      const encontrado = dbSimulada.find(a => a.codigo.toLowerCase() === search.toLowerCase());
      if (encontrado) setArticulo(encontrado);
      else {
        setArticulo(null);
        setModalVisible(false);
        setModalAviso({ visible: true, titulo: "No encontrado", mensaje: "No se encontró el artículo." });
      }
      setCargando(false);
    }, 1000);
  };

  const menuItems = [
    { id: "1", title: "Almacén", icon: "warehouse", color:"#3182ce"   },
    { id: "2", title: "Despachos", icon: "truck-delivery", color:"#0b4e27" },
    { id: "3", title: "Inventario", icon: "clipboard-list", color:"#ecc94b" },
    { id: "4", title: "Configuración", icon: "cog", color:"#a0aec0" },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => {
        if (item.id === "1") navigation.navigate("Almacen");
        //else if (item.id === "4") navigation.navigate("Configuracion");
        else setModalAviso({ visible: true, titulo: "Próximamente", mensaje: `Módulo ${item.title} en desarrollo.` });
      }}
    >
      <View style={[styles.iconBox,  { backgroundColor: user.tema === 'dark' ? theme.card : `${item.color}20` , color:user.tema === 'dark' ?`${item.color}`:theme.text}] }>
        <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={user.tema === 'dark' ? "light-content" : "dark-content"} />
      
      <View style={[styles.navbar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.navLeft}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#3182ce" />
          <Text style={[styles.navText, { color: theme.text }]}>EXORTA ERP</Text>
        </View>

        <TouchableOpacity style={styles.navRight} onPress={handleLogout}>
          <Text style={[styles.navUser, { color: theme.textSub }]}>{user.nombre || "Usuario"}</Text>
          <MaterialCommunityIcons name="logout" size={22} color="#e53e3e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <TextInput
                placeholder="Escanear o escribir código..."
                placeholderTextColor={theme.textSub}
                style={[styles.input, { color: theme.text }]}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={buscarArticulo}
              />
              <TouchableOpacity onPress={buscarArticulo} style={styles.searchBtn}>
                <MaterialCommunityIcons name="barcode-scan" size={26} color="#3182ce" />
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
      />

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalResultContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {cargando ? (
              <ActivityIndicator size="large" color="#3182ce" />
            ) : (
              articulo && (
                <View>
                  <Text style={[styles.modalArtTitle, { color: theme.text }]}>{articulo.descripcion}</Text>
                  {articulo.foto && <Image source={{ uri: articulo.foto }} style={styles.artImage} />}
                  <View style={[styles.artFichaBox, { backgroundColor: theme.bg }]}>
                    <View style={styles.artInfoBox}>
                      <Text style={styles.artLabel}>CÓDIGO</Text>
                      <Text style={[styles.artValue, { color: theme.text }]}>{articulo.codigo}</Text>
                    </View>
                    <View style={styles.artInfoBox}>
                      <Text style={styles.artLabel}>UBICACIÓN</Text>
                      <Text style={[styles.artValue, { color: theme.text }]}>{articulo.ubicacion}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
                    <Text style={styles.btnCloseText}>CERRAR</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>
      </Modal>

      <CustomModal
        visible={modalAviso.visible}
        titulo={modalAviso.titulo}
        mensaje={modalAviso.mensaje}
        onClose={() => setModalAviso({ ...modalAviso, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, height: 60, borderBottomWidth: 1 },
  navLeft: { flexDirection: "row", alignItems: "center" },
  navText: { marginLeft: 10, fontSize: 16, fontWeight: "bold" },
  navRight: { flexDirection: "row", alignItems: "center", cursor: Platform.OS === 'web' ? 'pointer' : 'auto' },
  navUser: { marginRight: 10, fontSize: 14 },
  scrollContent: { paddingBottom: 20 },
  headerContainer: { padding: 20 },
  searchBox: { flexDirection: "row", height: 60, borderRadius: 15, borderWidth: 1, alignItems: "center", paddingHorizontal: 15 },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' }, // Quita el borde azul en web
  searchBtn: { padding: 5 },
  menuItem: { flex: 1, margin: 10, padding: 20, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  menuLabel: { fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalResultContent: { width: "90%", maxWidth: 500, borderRadius: 20, padding: 25, borderWidth: 1 },
  modalArtTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  artImage: { width: "100%", height: 180, borderRadius: 15, marginBottom: 20, resizeMode: "contain" },
  artFichaBox: { padding: 15, borderRadius: 12, marginBottom: 20 },
  artInfoBox: { marginBottom: 10 },
  artLabel: { color: "#3182ce", fontSize: 12, fontWeight: "bold" },
  artValue: { fontSize: 18, marginTop: 2 },
  btnClose: { backgroundColor: "#3182ce", padding: 16, borderRadius: 12, alignItems: "center" },
  btnCloseText: { color: "white", fontWeight: "bold" }
});