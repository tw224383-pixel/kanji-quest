"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { ThemeBackground } from "./ThemeBackground";
import { useThemeContext } from "../../contexts/ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useUser();
  const { previewTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = previewTheme ?? userData?.theme ?? "default";
  const isDefaultTheme = !activeTheme || activeTheme === "default";

  if (!mounted) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <ThemeBackground theme={activeTheme} />
      </div>
      {children}
    </>
  );
}
