"use client";

import React, { createContext, useContext, useState } from "react";

type ThemeContextType = {
  previewTheme: string | null;
  setPreviewTheme: (theme: string | null) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  return (
    <ThemeContext.Provider value={{ previewTheme, setPreviewTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeContextProvider");
  }
  return context;
}
