'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DashboardState {
  selectedCryptos: number[];
  days: number;
  activeTab: string;
  chartLayout: 'grid' | 'list';
}

interface DashboardContextType {
  state: DashboardState;
  setSelectedCryptos: (cryptos: number[]) => void;
  setDays: (days: number) => void;
  setActiveTab: (tab: string) => void;
  setChartLayout: (layout: 'grid' | 'list') => void;
  savePreferences: () => void;
  loadPreferences: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const defaultState: DashboardState = {
  selectedCryptos: [],
  days: 90,
  activeTab: 'overview',
  chartLayout: 'grid',
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(defaultState);

  useEffect(() => {
    loadPreferences();
  }, []);

  const setSelectedCryptos = (cryptos: number[]) => {
    setState(prev => ({ ...prev, selectedCryptos: cryptos }));
  };

  const setDays = (days: number) => {
    setState(prev => ({ ...prev, days }));
  };

  const setActiveTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const setChartLayout = (layout: 'grid' | 'list') => {
    setState(prev => ({ ...prev, chartLayout: layout }));
  };

  const savePreferences = () => {
    localStorage.setItem('dashboardPreferences', JSON.stringify(state));
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem('dashboardPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (error) {
        console.error('Failed to load dashboard preferences:', error);
      }
    }
  };

  // Auto-save preferences when state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      savePreferences();
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

  return (
    <DashboardContext.Provider
      value={{
        state,
        setSelectedCryptos,
        setDays,
        setActiveTab,
        setChartLayout,
        savePreferences,
        loadPreferences,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
