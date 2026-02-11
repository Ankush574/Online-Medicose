import React, { createContext, useContext, useCallback, useState } from "react";

const SidebarContext = createContext({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {}
});

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => setIsOpen(true), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);
  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
