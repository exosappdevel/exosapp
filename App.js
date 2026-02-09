import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'style.pointerEvents'
]);
import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./src/context/AppContext";

// 1. Importa tus nuevas pantallas
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MercanciaScreen from "./src/screens/MercanciaScreen";
import FormularioMovimiento from "./src/screens/FormularioMovimiento";
import AlmacenScreen from "./src/screens/AlmacenScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false, // Ocultamos el header por defecto para mantener tu diseño oscuro
            animation: "slide_from_right", // Animación fluida entre pantallas
          }}
        >
          {/* Pantallas principales */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />

          {/* Flujo de Mercancía */}
          <Stack.Screen
            name="Mercancia"
            component={MercanciaScreen}
            options={{
              headerShown: true,
              title: "Gestión de Mercancía",
              headerStyle: { backgroundColor: "#121212" },
              headerTintColor: "white",
            }}
          />
          {/* Flujo de Almacén */}
          <Stack.Screen
            name="Almacen"
            component={AlmacenScreen}
            options={{
              headerShown: true,
              title: "Gestión de Almacén",
              headerStyle: { backgroundColor: "#121212" },
              headerTintColor: "white",
            }}
          />
          {/* Usamos la misma pantalla de formulario para Recepción y Entrega.
              Pasaremos parámetros (route.params) para saber qué etiquetas mostrar.
          */}
          <Stack.Screen
            name="FormularioMovimiento"
            component={FormularioMovimiento}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
