"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { PrivateRecordKey } from "@/lib/enterprise";

/**
 * One of the portal's private lists — customers, adoption figures, pricing or
 * updates — read from and written back to `/api/admin/records/<key>`.
 *
 * `save` replaces the whole list. The server checks every item before writing
 * anything, so a refused save leaves both the server and this copy unchanged.
 */
export function useRecords<T>(key: PrivateRecordKey) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = useRef(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ items: T[] }>(`/api/admin/records/${key}`);
      if (live.current) {
        setItems(Array.isArray(data.items) ? data.items : []);
        setError(null);
      }
    } catch (e) {
      if (live.current) setError(errorMessage(e));
    } finally {
      if (live.current) setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    live.current = true;
    void reload();
    return () => {
      live.current = false;
    };
  }, [reload]);

  /** Writes the list; resolves true once the server has accepted it. */
  const save = useCallback(
    async (next: T[]): Promise<boolean> => {
      setSaving(true);
      try {
        await api(`/api/admin/records/${key}`, { method: "PUT", body: { items: next } });
        if (live.current) {
          setItems(next);
          setError(null);
        }
        return true;
      } catch (e) {
        if (live.current) setError(errorMessage(e));
        return false;
      } finally {
        if (live.current) setSaving(false);
      }
    },
    [key],
  );

  return { items, loading, saving, error, save, reload };
}
