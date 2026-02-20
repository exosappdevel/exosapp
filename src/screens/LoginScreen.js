import React, { useState, useContext, useEffect } from "react";
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
import ApiService from "../services/ApiServices";

export default function LoginScreen({ navigation }) {

  // Extraemos lo que necesitamos del contexto
  const { appConfig, setUser } = useContext(AppContext);

  // Estados locales para el formulario
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  // Inicializamos el servicio con la configuración del contexto
  useEffect(() => {
    ApiService.init(appConfig);
  }, [appConfig]);
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
            id_usuario_app:1,
            id_usuario:1,
            id_almacen:1,
            nombre: "Jonatan R"
          }
        };
      } else {

        data = await ApiService.inicia_sesion(usuario, password);
      }
      // 3. Manejo de la respuesta
      if (data.result === "ok") {
        setMensajeError(data.result_text || "Inicio de sesión exitoso");
        // Guardamos los datos en el contexto global
        setUser({
          id_usuario_app:data.id_usuario_app,
          id_usuario:data.id_usuario,
          id_almacen: data.id_almacen,
          nombre: data.alias_usuario.toUpperCase(),
          tema: data.tema || "light"
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
          source={require("../../assets/exosapp_logo.png")}
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
        <Image
          source={require("../../assets/logo_Elidev.png")}
          style={styles.logo_elidev}
          resizeMode="contain"
        />
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
    //backgroundColor: "#ececec", // Fondo blanco para el logo
    alignSelf: "center", // Se asegura de estar centrado si el padre es más ancho
  },
  logo_elidev: {
    width: "50%",       // Ocupa todo el ancho disponible del padre
    maxWidth: 200,      // Pero no se pasa del máximo que tiene el form
    height: 60,        // Ajusta la altura a tu gusto
    marginBottom: 0,
    marginTop: 100,
    marginLeft:200,
    borderRadius: 8,
    //backgroundColor: "#ececec", // Fondo blanco para el logo
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
