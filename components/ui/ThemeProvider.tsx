"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { ThemeBackground } from "./ThemeBackground";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = userData?.theme || "default";

  if (!mounted) return <>{children}</>;

  return (
    <>
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <ThemeBackground theme={theme} />
      </div>
      {children}
    </>
  );
}
