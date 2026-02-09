import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appConfig] = useState({
    passtrough_mode: true,
    name: "demo",
    server: "https://www.elidev.com.mx",
    passkey: "{PASSKEY}",
    url: "https://www.elidev.com.mx/demo/control.php",
  });

  const [user, setUser] = useState({ id: "", nombre: "" });

  return (
    <AppContext.Provider value={{ appConfig, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};