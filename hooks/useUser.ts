"use client";

import { useContext } from "react";
import { UserContext, UserData } from "../contexts/UserContext";

export type { UserData };

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
