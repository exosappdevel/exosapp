import React, { useState } from "react"; // Añadido useState
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,      // Añadido Modal
  TextInput,  // Añadido TextInput
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MercanciaScreen({ navigation }) {
  // ESTADOS
  const [modalBusqueda, setModalBusqueda] = useState(false);
  const [numABuscar, setNumABuscar] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState(""); // Para saber si buscamos recepción o entrega

  // Función para Nueva
  const irANueva = (tipo) => {
    navigation.navigate("FormularioMovimiento", { tipoMov: tipo, modo: "nueva" });
  };

  // Función para abrir el buscador al presionar Modificar
  const abrirBuscador = (tipo) => {
    setTipoSeleccionado(tipo);
    setModalBusqueda(true);
  };

  const handleBuscarMovimiento = () => {
    if (!numABuscar.trim()) {
      alert("Por favor ingresa un número de movimiento.");
      return;
    }

    // SIMULACIÓN: Datos que vendrían de tu PHP
    const movimientoEncontrado = {
      id: numABuscar.toUpperCase(),
      fecha: "18/12/2025",
      tipo: "Externo",
      entidadNombre: tipoSeleccionado === "recepcion" ? "Proveedor Aceros S.A." : "Cliente Querétaro",
      referencia: "REF-999",
      partidas: [
        { id: "10", codigo: "ART-01", descripcion: "Pala de punta", cant: 10 },
      ],
    };

    setModalBusqueda(false);
    setNumABuscar(""); // Limpiar búsqueda
    navigation.navigate("FormularioMovimiento", {
      modo: "modificar",
      tipoMov: tipoSeleccionado,
      datosMov: movimientoEncontrado,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mercancía</Text>

      {/* --- SECCIÓN RECEPCIÓN --- */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="dolly" size={40} color="#ff9800" />
          <Text style={styles.cardTitle}>Recepción en almacén</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.actionButton} onPress={() => irANueva("recepcion")}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
            <Text style={styles.actionText}>Nueva</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => abrirBuscador("recepcion")}>
            <MaterialCommunityIcons name="pencil" size={24} color="white" />
            <Text style={styles.actionText}>Modificar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- SECCIÓN ENTREGA --- */}
      <View style={[styles.sectionCard, { marginTop: 20 }]}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="truck-delivery" size={40} color="#2196f3" />
          <Text style={styles.cardTitle}>Entrega a cliente/interno</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: "#2d4a3e" }]} 
            onPress={() => irANueva("entrega")}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={24} color="white" />
            <Text style={styles.actionText}>Nueva</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: "#2d4a3e" }]} 
            onPress={() => abrirBuscador("entrega")}
          >
            <MaterialCommunityIcons name="file-document-edit" size={24} color="white" />
            <Text style={styles.actionText}>Modificar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DE BÚSQUEDA */}
      <Modal visible={modalBusqueda} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modificar {tipoSeleccionado.toUpperCase()}</Text>
            <Text style={{ color: "#aaa", marginBottom: 10, textAlign: 'center' }}>
              Ingrese el folio del movimiento:
            </Text>

            <TextInput
              style={styles.inputBusqueda}
              placeholder="Ej: MOV-123"
              placeholderTextColor="#666"
              autoCapitalize="characters"
              value={numABuscar}
              onChangeText={setNumABuscar}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.btnModal, { backgroundColor: "#444" }]}
                onPress={() => setModalBusqueda(false)}
              >
                <Text style={{ color: "white" }}>CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnModal, { backgroundColor: "#3182ce" }]}
                onPress={handleBuscarMovimiento}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>BUSCAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20, paddingTop: 50 },
  title: { color: "white", fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  sectionCard: { backgroundColor: "#1e1e1e", borderRadius: 15, padding: 20, borderWidth: 1, borderColor: "#333" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "600", marginLeft: 15 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { backgroundColor: "#1e3a5a", flex: 0.48, padding: 15, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" },
  actionText: { color: "white", marginLeft: 10, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e1e1e', padding: 25, borderRadius: 20, width: '85%', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  inputBusqueda: { backgroundColor: '#121212', color: 'white', padding: 15, borderRadius: 10, fontSize: 18, textAlign: 'center', borderWidth: 1, borderColor: '#3182ce', marginBottom: 10 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnModal: { padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' }
});