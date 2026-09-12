import {
  getBoundaries,
  type BoundaryFeatureCollection,
  type BoundaryQuery,
  type GetBoundariesOptions,
} from "@geo-atlas/core";
import { useEffect, useState } from "react";

export interface UseBoundariesResult {
  boundaries: BoundaryFeatureCollection | undefined;
  loading: boolean;
  error: Error | undefined;
}

export function useBoundaries(query: BoundaryQuery, options?: GetBoundariesOptions): UseBoundariesResult {
  const [boundaries, setBoundaries] = useState<BoundaryFeatureCollection>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    getBoundaries(query, options)
      .then((result) => {
        if (!cancelled) setBoundaries(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query.country, query.level, query.resolution]);

  return { boundaries, loading, error };
}
