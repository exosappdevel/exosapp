import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function FormularioMovimiento({ route, navigation }) {
  // Extraemos datosMov de los parámetros
  const { modo = 'nueva', tipoMov = 'recepcion', datosMov = null } = route.params || {};

  // --- ESTADOS ---
  // --- ESTADOS INICIALIZADOS CON DATOS RECIBIDOS SI EXISTEN ---
  const [numMovimiento, setNumMovimiento] = useState(datosMov ? datosMov.id : 'PENDIENTE');
  const [date, setDate] = useState(datosMov ? new Date() : new Date()); // Aquí podrías parsear la fecha recibida
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [folioAsignado, setFolioAsignado] = useState("");

  const [cabecera, setCabecera] = useState({
    fecha: datosMov ? datosMov.fecha : new Date().toLocaleDateString(),
    tipo: datosMov ? datosMov.tipo : 'Externo',
    entidadNombre: datosMov ? datosMov.entidadNombre : '',
    referencia: datosMov ? datosMov.referencia : '',
    observaciones: ''
  });

  const [partidas, setPartidas] = useState(datosMov ? datosMov.partidas : []);
  const [modalArticulos, setModalArticulos] = useState(false);
  const [modalEntidades, setModalEntidades] = useState(false);

  // --- DATOS SIMULADOS ---
  const catalogoEntidades =
    tipoMov === "recepcion"
      ? [
          { id: "1", nombre: "Proveedor Aceros S.A." },
          { id: "2", nombre: "Distribuidora Industrial" },
        ]
      : [
          { id: "1", nombre: "Cliente: Constructora QRO" },
          { id: "2", nombre: "Cliente: Logística Express" },
        ];

  const catalogoArticulos = [
    { id: "101", codigo: "ART-01", descripcion: "Pala de punta" },
    { id: "102", codigo: "ART-02", descripcion: "Carretilla reforzada" },
  ];

  // --- FUNCIONES ---
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    setCabecera({ ...cabecera, fecha: currentDate.toLocaleDateString() });
  };

  const validarOrden = () => {
    if (!cabecera.referencia.trim()) return;
    const ordenesExistentes = {
      "OC-100": [
        { id: "10", codigo: "ART-01", descripcion: "Pala de punta", cant: 5 },
        {
          id: "11",
          codigo: "ART-02",
          descripcion: "Carretilla reforzada",
          cant: 2,
        },
      ],
      "F-100":[
        { id: "10", codigo: "ART-01", descripcion: "Pala de punta", cant: 5 },
        {
          id: "11",
          codigo: "ART-01",
          descripcion: "Pala de punta",
          cant: 1,
        },
      ],
    };
    const encontradas = ordenesExistentes[cabecera.referencia.toUpperCase()];
    if (encontradas) {
      setPartidas(encontradas);
      Alert.alert("Éxito", "Orden encontrada y partidas cargadas.");
    } else {
      setPartidas([]);
      Alert.alert("Atención", `No existe la orden no. ${cabecera.referencia}`);
    }
  };

  const guardarCambios = () => {
    if (!cabecera.entidadNombre || partidas.length === 0) {
      // Para errores simples puedes usar alert estándar (funciona en web y móvil)
      alert("Faltan datos: Selecciona una entidad y agrega artículos.");
      return;
    }

    const nuevoId = Math.floor(Math.random() * 9000) + 1000;
    const folio = `MOV-${nuevoId}`;

    setFolioAsignado(folio);
    setNumMovimiento(folio);

    // En lugar de Alert.alert, abrimos nuestro modal personalizado
    setModalExito(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.mainTitle}>
          {modo === "nueva" ? "Nueva" : "Modificar"} {tipoMov.toUpperCase()}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* NÚMERO DE MOVIMIENTO */}
          <Text style={styles.label}>Número de Movimiento</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>{numMovimiento}</Text>
          </View>

          {/* FECHA */}
          <Text style={styles.label}>Fecha</Text>
          {Platform.OS === "web" ? (
            <TextInput
              style={styles.input}
              type="date"
              defaultValue={date.toISOString().substring(0, 10)}
              onChangeText={(t) => setCabecera({ ...cabecera, fecha: t })}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.inputDate}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: "#3182ce", fontWeight: "bold" }}>
                  {cabecera.fecha}
                </Text>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={20}
                  color="#3182ce"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </>
          )}

          {/* SELECCIÓN DE TIPO (Externo/Interno) */}
          <Text style={styles.label}>Origen / Destino</Text>
          <View style={styles.row}>
            {["Externo", "Interno"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  cabecera.tipo === opt && styles.chipActive,
                ]}
                onPress={() =>
                  setCabecera({ ...cabecera, tipo: opt, entidadNombre: "" })
                }
              >
                <Text style={styles.chipText}>
                  {opt === "Externo"
                    ? tipoMov === "recepcion"
                      ? "Proveedor"
                      : "Cliente"
                    : "Interna"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BUSCADOR DE ENTIDAD */}
          <Text style={styles.label}>
            {cabecera.tipo === "Interno"
              ? "Departamento"
              : tipoMov === "recepcion"
              ? "Proveedor"
              : "Cliente"}
          </Text>
          <TouchableOpacity
            style={styles.searchPicker}
            onPress={() => setModalEntidades(true)}
          >
            <Text style={{ color: cabecera.entidadNombre ? "white" : "#666" }}>
              {cabecera.entidadNombre || `Seleccionar...`}
            </Text>
            <MaterialCommunityIcons name="magnify" size={20} color="#3182ce" />
          </TouchableOpacity>

          {/* REFERENCIA DINÁMICA */}
          <Text style={styles.label}>
            {cabecera.tipo === "Interno"
              ? "No. Pedido"
              : tipoMov === "recepcion"
              ? "Orden de Compra"
              : "No. Factura"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese referencia..."
            placeholderTextColor="#666"
            value={cabecera.referencia}
            onChangeText={(t) => setCabecera({ ...cabecera, referencia: t })}
            onBlur={validarOrden}
          />
        </View>

        {/* LISTA DE PARTIDAS */}
        <View style={styles.partidasHeader}>
          <Text style={styles.partidasTitle}>
            Artículos ({partidas.length})
          </Text>
          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => setModalArticulos(true)}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color="#48bb78"
            />
            <Text
              style={{ color: "#48bb78", marginLeft: 5, fontWeight: "bold" }}
            >
              Agregar
            </Text>
          </TouchableOpacity>
        </View>

        {partidas.map((item) => (
          <View key={item.id} style={styles.partidaItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.descripcion}
              </Text>
              <Text style={{ color: "#888", fontSize: 12 }}>{item.codigo}</Text>
            </View>
            <TextInput
              style={styles.inputCant}
              keyboardType="numeric"
              value={item.cant.toString()}
              onChangeText={(v) => {
                const n = parseInt(v) || 0;
                setPartidas(
                  partidas.map((p) =>
                    p.id === item.id ? { ...p, cant: n } : p
                  )
                );
              }}
            />
            <TouchableOpacity
              onPress={() =>
                setPartidas(partidas.filter((p) => p.id !== item.id))
              }
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color="#f56565"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSave} onPress={guardarCambios}>
          <Text style={styles.btnText}>GUARDAR MOVIMIENTO</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL ENTIDADES */}
      <Modal visible={modalEntidades} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar</Text>
            <FlatList
              data={catalogoEntidades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resItem}
                  onPress={() => {
                    setCabecera({ ...cabecera, entidadNombre: item.nombre });
                    setModalEntidades(false);
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>
                    {item.nombre}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.btnCerrar}
              onPress={() => setModalEntidades(false)}
            >
              <Text style={{ color: "white" }}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ARTÍCULOS */}
      <Modal visible={modalArticulos} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Artículo</Text>
            <FlatList
              data={catalogoArticulos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resItem}
                  onPress={() => {
                    setPartidas([...partidas, { ...item, cant: 1 }]);
                    setModalArticulos(false);
                  }}
                >
                  <Text style={{ color: "#3182ce", fontWeight: "bold" }}>
                    {item.codigo}
                  </Text>
                  <Text style={{ color: "white" }}>{item.descripcion}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.btnCerrar}
              onPress={() => setModalArticulos(false)}
            >
              <Text style={{ color: "white" }}>VOLVER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* MODAL DE ÉXITO PERSONALIZADO */}
      <Modal visible={modalExito} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalExitoContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#48bb78"
            />
            <Text style={styles.modalExitoTitle}>¡Guardado con éxito!</Text>
            <Text style={styles.modalExitoText}>
              Tus cambios fueron registrados con el No.
            </Text>
            <Text style={styles.modalExitoFolio}>{folioAsignado}</Text>

            <TouchableOpacity
              style={styles.btnFinalizar}
              onPress={() => {
                setModalExito(false);
                navigation.goBack(); // Regresa a Gestión de Mercancía
              }}
            >
              <Text style={styles.btnTextFinalizar}>ENTENDIDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1e1e1e",
  },
  mainTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: { padding: 15 },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  label: { color: "#aaa", marginBottom: 8, fontSize: 13, fontWeight: "bold" },
  input: {
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 12,
    color: "white",
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#333",
  },
  disabledText: { color: "#ff9800", fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row", marginBottom: 15 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    marginRight: 10,
  },
  chipActive: { backgroundColor: "#3182ce", borderColor: "#3182ce" },
  chipText: { color: "white", fontSize: 12 },
  inputDate: {
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3182ce",
  },
  searchPicker: {
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partidasHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  partidasTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  btnAdd: { flexDirection: "row", alignItems: "center" },
  partidaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3182ce",
  },
  inputCant: {
    backgroundColor: "#1e1e1e",
    color: "white",
    width: 60,
    textAlign: "center",
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#444",
  },
  footer: { padding: 20, backgroundColor: "#1e1e1e" },
  btnSave: {
    backgroundColor: "#48bb78",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  resItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  btnCerrar: {
    marginTop: 20,
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalExitoContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
    borderWidth: 1,
    borderColor: "#48bb78",
  },
  modalExitoTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
  },
  modalExitoText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  modalExitoFolio: {
    color: "#48bb78",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
  },
  btnFinalizar: {
    backgroundColor: "#48bb78",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  btnTextFinalizar: { color: "white", fontWeight: "bold", fontSize: 16 },
});
