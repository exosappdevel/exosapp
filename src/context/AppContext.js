import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appConfig] = useState({
    passtrough_mode: false,
    name: "exosapp",
    server: "https://exorta.exos.software/",
    passkey: "{PASSKEY}",
    url: "https://exorta.exos.software/",
  });

  const [user, setUser] = useState({ id: "", nombre: "" });

  return (
    <AppContext.Provider value={{ appConfig, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};