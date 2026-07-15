import { useCallback, useEffect, useState } from 'react';

import { loadActiveSites, persistActiveSites } from '@/lib/sites';

/** The sites the user has chosen, persisted locally. */
export function useActiveSites() {
  const [activeSiteIds, setActiveSiteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadActiveSites().then((ids) => {
      if (!active) return;
      setActiveSiteIds(ids);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const saveSites = useCallback((ids: string[]) => {
    setActiveSiteIds(ids);
    void persistActiveSites(ids);
  }, []);

  return { activeSiteIds, isLoading, saveSites };
}
