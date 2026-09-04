"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface FinanceDashboardContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const FinanceDashboardContext =
  createContext<FinanceDashboardContextValue | undefined>(undefined);

const STORAGE_KEY = "itmt-finance-sidebar-collapsed";

export function FinanceDashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored === "true") {
        setCollapsedState(true);
      }
    } catch (error) {
      console.error(
        "Unable to restore finance sidebar state:",
        error,
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(collapsed),
      );
    } catch (error) {
      console.error(
        "Unable to save finance sidebar state:",
        error,
      );
    }
  }, [collapsed, hydrated]);

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value);
  };

  const toggleSidebar = () => {
    setCollapsedState((current) => !current);
  };

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleSidebar,
    }),
    [collapsed],
  );

  return (
    <FinanceDashboardContext.Provider value={value}>
      {children}
    </FinanceDashboardContext.Provider>
  );
}

export function useFinanceDashboard() {
  const context = useContext(FinanceDashboardContext);

  if (!context) {
    throw new Error(
      "useFinanceDashboard must be used inside FinanceDashboardProvider.",
    );
  }

  return context;
}