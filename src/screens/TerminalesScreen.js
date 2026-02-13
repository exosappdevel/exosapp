import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import ApiService from '../services/ApiServices';

export default function TerminalesScreen({ navigation }) {
  const { user } = useContext(AppContext);
  const [terminales, setTerminales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerminales = async () => {
      try {
        const data = await ApiService.get_terminales_list(user.id_sesion);
        // Si data es un array (gracias al parseXmlToJson), lo guardamos
        setTerminales(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTerminales();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Terminales Disponibles</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" />
      ) : (
        <FlatList
          data={terminales}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate("Pickeo", { id_terminal: item.id_terminal })}
            >
              <Text style={styles.cardText}>{item.nombre}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#1e1e1e', 
    padding: 20, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  cardText: { color: 'white', fontSize: 16 }
});