"use client";

import { useEffect, useState, useCallback } from "react";

export interface SpotifyTrackInfo {
  connected: boolean;
  isPlaying: boolean;
  requiresPremium?: boolean;
  error?: string;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
  playedAt?: string;
}

export interface DualNowPlayingData {
  paris: SpotifyTrackInfo;
  raleigh: SpotifyTrackInfo;
}

export function useSpotifyNowPlaying() {
  const [data, setData] = useState<DualNowPlayingData>({
    paris: { connected: false, isPlaying: false },
    raleigh: { connected: false, isPlaying: false },
  });
  const [loading, setLoading] = useState(true);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNowPlaying();
    const interval = setInterval(() => {
      void fetchNowPlaying();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  return { data, loading, refresh: fetchNowPlaying };
}
