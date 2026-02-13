import { Alert, Platform } from "react-native";

/**
 * Muestra un popup genérico compatible con Web y Móvil
 * @param {string} mensaje - El texto a mostrar
 * @param {string} titulo - (Opcional) El título de la alerta
 */
export const popup = (mensaje, titulo = "Atención") => {
  if (Platform.OS === 'web') {
    // Uso de alert nativo del navegador para compatibilidad web
    window.alert(`${titulo}\n\n${mensaje}`);
  } else {
    // Uso de Alert de React Native para una interfaz nativa en iOS/Android
    Alert.alert(
      titulo,
      mensaje,
      [{ text: "Aceptar", style: "default" }]
    );
  }
};