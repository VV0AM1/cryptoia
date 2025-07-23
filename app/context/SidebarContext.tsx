'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type SidebarContextType = {
  isOpened: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpened, setIsOpened] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sidebarOpened');
    if (stored !== null) setIsOpened(stored === 'true');
  }, []);

  const toggle = () => {
    const newState = !isOpened;
    setIsOpened(newState);
    localStorage.setItem('sidebarOpened', String(newState));
  };

  return (
    <SidebarContext.Provider value={{ isOpened, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
};