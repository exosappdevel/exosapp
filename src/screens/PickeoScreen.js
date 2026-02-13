import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import ApiService from '../services/ApiServices'; 
import { calcularPrioridad } from '../utils/PickeoUtils';

export default function PickeoScreen({ navigation, route }) {
  const { user } = useContext(AppContext);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCompletos, setMostrarCompletos] = useState(true);
  const [sortBy, setSortBy] = useState('prioridad');
  const [modalCant, setModalCant] = useState({ visible: false, item: null, cantidad: "1", esResta: false });

  const id_terminal = route.params?.id_terminal;

  useEffect(() => {
    fetchPickeo();
  }, [id_terminal]);

  const fetchPickeo = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get_pickeo_list(id_terminal);
      const listaRaw = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);

      const procesados = listaRaw.map(p => {
        const sol = parseInt(p.cantidad_solicitada || 0);
        const rec = parseInt(p.cantidad_recolectada || 0);
        const info = calcularPrioridad(sol, rec);
        return {
          ...p,
          id: p.id || p.id_producto || Math.random().toString(),
          cantidad_solicitada: sol,
          cantidad_recolectada: rec,
          ...info
        };
      });
      setProductos(procesados);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = () => {
    const valor = parseInt(modalCant.cantidad) || 0;
    const actualizados = productos.map(p => {
      if (p.id === modalCant.item.id) {
        const nuevaReco = modalCant.esResta 
          ? Math.max(0, p.cantidad_recolectada - valor) 
          : p.cantidad_recolectada + valor;
        const info = calcularPrioridad(p.cantidad_solicitada, nuevaReco);
        return { ...p, cantidad_recolectada: nuevaReco, ...info };
      }
      return p;
    });
    setProductos(actualizados);
    setModalCant({ visible: false, item: null, cantidad: "1", esResta: false });
  };

  const listaProcesada = productos
    .filter(p => mostrarCompletos || p.faltante > 0)
    .sort((a, b) => {
      if (sortBy === 'prioridad') return a.prioridad - b.prioridad;
      return (a.referencia || "").localeCompare(b.referencia || "");
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Terminal {id_terminal}</Text>
        
        <TouchableOpacity 
          onPress={() => setSortBy(sortBy === 'prioridad' ? 'referencia' : 'prioridad')}
          style={styles.sortBtn}
        >
          <MaterialCommunityIcons 
            name={sortBy === 'prioridad' ? "sort-numeric-ascending" : "sort-alphabetical-ascending"} 
            size={24} 
            color="#3182ce" 
          />
          <Text style={styles.sortText}>{sortBy === 'prioridad' ? 'PRIOR.' : 'REF.'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={listaProcesada}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isDone = item.faltante === 0;
            return (
              <View style={styles.itemRow}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.textMain}>{item.descripcion}</Text>
                  <Text style={styles.textSub}>{item.referencia}</Text>
                  <Text style={styles.textStatus}>
                    {isDone ? "✓ COMPLETADO" : `Faltan: ${item.faltante}`} ({item.cantidad_recolectada}/{item.cantidad_solicitada})
                  </Text>
                </View>
                
                {/* BOTÓN CON COLOR DE PRIORIDAD DINÁMICO */}
                <TouchableOpacity 
                  style={[styles.pickBtn, { backgroundColor: item.color }]} 
                  onPress={() => setModalCant({ visible: true, item, cantidad: "1", esResta: isDone })}
                >
                  <MaterialCommunityIcons 
                    name={isDone ? "cart-remove" : "cart-plus"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay productos</Text>}
        />
      )}

      <TouchableOpacity style={styles.footerBtn} onPress={() => setMostrarCompletos(!mostrarCompletos)}>
        <MaterialCommunityIcons name={mostrarCompletos ? "eye-off" : "eye"} size={20} color="white" />
        <Text style={styles.footerBtnText}>
          {mostrarCompletos ? "OCULTAR COMPLETADOS" : "MOSTRAR TODOS"}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalCant.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: modalCant.esResta ? "#f56565" : "white" }]}>
              {modalCant.esResta ? "Restar Cantidad" : "Recolectar Cantidad"}
            </Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={modalCant.cantidad} 
              onChangeText={(t) => setModalCant({...modalCant, cantidad: t})} 
              autoFocus 
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalCant({...modalCant, visible: false})}>
                <Text style={{ color: '#888', marginRight: 25 }}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnConfirm, { backgroundColor: modalCant.esResta ? "#f56565" : "#3182ce" }]} 
                onPress={handlePick}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{modalCant.esResta ? "RESTAR" : "PICK"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  sortBtn: { alignItems: 'center', justifyContent: 'center', minWidth: 50 },
  sortText: { color: '#3182ce', fontSize: 9, fontWeight: 'bold', marginTop: -2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  textMain: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  textSub: { color: '#888', fontSize: 12 },
  textStatus: { color: '#3182ce', fontSize: 11, marginTop: 4, fontWeight: '600' },
  pickBtn: { padding: 10, borderRadius: 8 }, // Eliminado el color fijo de aquí
  footerBtn: { flexDirection: 'row', backgroundColor: '#2d3748', padding: 15, justifyContent: 'center', alignItems: 'center' },
  footerBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  emptyText: { color: 'gray', textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e1e1e', width: '80%', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#121212', color: 'white', padding: 15, borderRadius: 10, fontSize: 24, textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  btnConfirm: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }
});