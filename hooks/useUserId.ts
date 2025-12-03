/**
 * Custom hook for managing user ID
 */

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/constants";
import { generateUserId } from "@/lib/utils";

export function useUserId(): string {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedUserId = sessionStorage.getItem(STORAGE_KEYS.COMPOSIO_USER_ID);
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = generateUserId();
      sessionStorage.setItem(STORAGE_KEYS.COMPOSIO_USER_ID, newUserId);
      setUserId(newUserId);
    }
  }, []);

  return userId;
}

