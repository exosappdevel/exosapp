import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import ApiService from '../services/ApiServices';

export default function TerminalesScreen({ navigation }) {
  const { user, theme } = useContext(AppContext);
  const [terminales, setTerminales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerminales();
  }, []);

  const fetchTerminales = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get_terminales_list(user.id_usuario,user.id_almacen);
      setTerminales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER CON BOTÓN REGRESAR */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Terminales</Text>
        <View style={{ width: 28 }} /> {/* Espaciador para centrar el título */}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3182ce" />
        </View>
      ) : (
        <FlatList
          data={terminales}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate("Pickeo", { id_terminal: item.id_terminal })}
            >
              <View style={styles.cardContent}>
                <MaterialCommunityIcons name="monitor-dashboard" size={24} color="#3182ce" />
                <Text style={[styles.cardText, { color: theme.text }]}>{item.nombre}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSub} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSub }]}>No hay terminales disponibles</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 10,
    marginBottom: 10
  },
  backBtn: { padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});