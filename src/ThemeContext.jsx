import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  mode: "light",
  toggleMode: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("themeMode") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const enableDark = mode === "dark";
    document.documentElement.classList.toggle("dark-mode", enableDark);
    document.body.classList.toggle("dark-mode", enableDark);
    document.documentElement.dataset.theme = mode;
    document.body.dataset.theme = mode;
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((prev) => (prev === "dark" ? "light" : "dark"))
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
