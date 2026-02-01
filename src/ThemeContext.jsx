import React, { createContext, useContext } from "react";

const ThemeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Theme is fixed to light; no DOM classes or localStorage writes.
  const value = { mode: "light", toggleMode: () => {} };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
