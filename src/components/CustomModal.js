import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomModal({ visible, titulo, mensaje, icon, colorIcon, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons 
            name={icon || "alert-circle-outline"} 
            size={70} 
            color={colorIcon || "#f56565"} 
          />
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <TouchableOpacity style={styles.btnCerrar} onPress={onClose}>
            <Text style={styles.btnText}>ENTENDIDO</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)", // Mismo fondo que tu buscador
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e1e1e", // Estilo oscuro de la app
    width: "80%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  titulo: { color: "white", fontSize: 20, fontWeight: "bold", marginTop: 15 },
  mensaje: { color: "#bbb", fontSize: 16, textAlign: "center", marginTop: 10, marginBottom: 20 },
  btnCerrar: {
    backgroundColor: "#3182ce", // Azul de tus botones
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "bold" }
});