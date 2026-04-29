import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getSavedRooms, saveRoom, unsaveRoom } from "../services/wishlist";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) { setSavedIds(new Set()); return; }
    setLoading(true);
    try {
      const res = await getSavedRooms();
      setSavedIds(new Set(res.data.map((item) => item.room_id)));
    } catch {
      // silently ignore — user may not have any saved rooms yet
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const isSaved = useCallback((roomId) => savedIds.has(roomId), [savedIds]);

  const toggle = useCallback(async (roomId) => {
    if (!isAuthenticated) return false; // caller should handle auth gate
    const wasSaved = savedIds.has(roomId);
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(roomId) : next.add(roomId);
      return next;
    });
    try {
      if (wasSaved) {
        await unsaveRoom(roomId);
      } else {
        await saveRoom(roomId);
      }
    } catch {
      // Revert on error
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(roomId) : next.delete(roomId);
        return next;
      });
    }
    return !wasSaved; // new saved state
  }, [isAuthenticated, savedIds]);

  return (
    <WishlistContext.Provider value={{ savedIds, isSaved, toggle, loading, reload: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
