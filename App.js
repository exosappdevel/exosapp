import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./src/context/AppContext";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AlmacenScreen from "./src/screens/AlmacenScreen";
import TerminalesScreen from "./src/screens/TerminalesScreen"; 
import PickeoScreen from "./src/screens/PickeoScreen"; 
import CambioAlmacen from "./src/screens/CambioAlmacen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CambioAlmacen" component={CambioAlmacen} />
          <Stack.Screen name="Almacen" component={AlmacenScreen} />
          
          {/* Registro de nuevas pantallas de Pickeo */}
          <Stack.Screen name="Terminales" component={TerminalesScreen} />
          <Stack.Screen name="Pickeo" component={PickeoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}