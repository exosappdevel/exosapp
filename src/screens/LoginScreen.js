import React, { useState, useContext } from "react";
import Constants from "expo-constants";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

// Importamos el contexto para usar los parámetros globales
import { AppContext } from "../context/AppContext";

export default function LoginScreen({ navigation }) {
  // Extraemos lo que necesitamos del contexto
  const { appConfig, setUser } = useContext(AppContext);

  // Estados locales para el formulario
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setMensajeError("");

    // 1. Validación simple
    if (!usuario.trim() || !password.trim()) {
      setMensajeError("proporcione datos validos");
      return;
    }

    setCargando(true);

    try {
      let data = {};
      if (appConfig.passtrough_mode) {
        data = {
          result: "ok",
          user_data: {
            id: 1,
            sys_id: 1003,
            nombre: "Jonatan R",
            email: "hecjona@gmail.com"
          }
        };
      } else {
        // 2. Petición al servidor PHP
        const response = await fetch(appConfig.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: usuario,
            pass: password,
            key: appConfig.passkey,
          }),
        });

        data = await response.json();
      }
      // 3. Manejo de la respuesta
      if (data.result === "ok") {
        // Guardamos los datos en el contexto global
        setUser({
          id: data.user_data.id,
          sys_id: data.user_data.sys_id,
          nombre: data.user_data.nombre,
          email: data.user_data.email,
        });

        // Navegamos a la pantalla Home
        navigation.replace("Home");
      } else {
        // Error enviado por el PHP (ej: "Usuario no encontrado")
        setMensajeError(data.result_text || "Error en las credenciales");
      }
    } catch (error) {
      console.error(error);
      setMensajeError("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS == "ios" ? 100 : 0}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* LOGO - La ruta sube dos niveles para llegar a assets */}
        <Image
          source={require("../../assets/logo-default.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#ccc"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#ccc"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Mensaje de error dinámico */}
          {mensajeError ? (
            <Text style={styles.errorText}>{mensajeError}</Text>
          ) : null}

          {/* Botón con indicador de carga */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#03659a" />
            ) : (
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

          {/*<TouchableOpacity>
            <Text style={styles.link}>¿olvidaste tu contraseña?</Text>
          </TouchableOpacity>*/}
          {/*} <Text style={styles.versionText}>Versión de la App: {Constants.expoConfig?.version || Constants.manifest?.version}</Text>*/}

          <Text style={styles.versionText}>
            Versión de la App: {Constants.expoConfig?.extra?.appVersion || "Cargando..."}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003857" // Dark background for better contrast
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: "100%",       // Ocupa todo el ancho disponible del padre
    maxWidth: 400,      // Pero no se pasa del máximo que tiene el form
    height: 120,        // Ajusta la altura a tu gusto
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: "#ececec", // Fondo blanco para el logo
    alignSelf: "center", // Se asegura de estar centrado si el padre es más ancho
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  label: {
    color: "white",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    padding: 12,
    color: "white",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    height: 55,
    justifyContent: "center",
  },
  buttonText: {
    color: "#03659a",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "yellow",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  link: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",

  },
  versionText: {
    color: "white",
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
  },
});
