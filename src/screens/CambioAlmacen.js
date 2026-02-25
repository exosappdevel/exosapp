import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import ApiService from "../services/ApiServices";

export default function CambioAlmacen({ navigation }) {
  const { user, setUser, theme } = useContext(AppContext);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  const fetchAlmacenes = async () => {
    try {
      setLoading(true);
      // ApiService.parseXmlToJson ya devuelve un Array gracias a la mejora en ApiServices.js
      const data = await ApiService.get_almacenes_list(user.id_usuario);
      setAlmacenes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar almacenes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Esta es la función que faltaba para procesar la selección
  const seleccionarAlmacen = (almacen) => {
    // Actualiza las variables globales del usuario en el AppContext
    setUser({
      ...user,
      id_almacen: almacen.id_almacen,
      almacen_nombre: almacen.nombre,
      almacen_codigo: almacen.codigo,
    });
    
    // Navega de regreso a la pantalla anterior (Home)
    navigation.goBack();
  };

  const renderAlmacen = ({ item }) => {
    // Comparación segura de IDs
    const esSeleccionado = String(user.id_almacen) === String(item.id_almacen);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { 
            backgroundColor: theme.card, 
            borderColor: esSeleccionado ? "#3182ce" : theme.border,
            borderWidth: esSeleccionado ? 2 : 1
          },
        ]}
        onPress={() => seleccionarAlmacen(item)}
      >
        <View style={styles.infoContainer}>
          <Text style={[styles.codigo, { color: "#3182ce" }]}>{item.codigo}</Text>
          <Text style={[styles.nombre, { color: theme.text }]}>{item.nombre}</Text>
        </View>
        {esSeleccionado && (
          <MaterialCommunityIcons name="check-circle" size={24} color="#3182ce" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Cambio de Almacén</Text>
        <View style={{ width: 38 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={almacenes}
          keyExtractor={(item, index) => item.id_almacen?.toString() || index.toString()}
          renderItem={renderAlmacen}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: theme.textSub, marginTop: 20 }}>
              No hay almacenes disponibles.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  infoContainer: { flex: 1 },
  codigo: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  nombre: { fontSize: 16 },
});