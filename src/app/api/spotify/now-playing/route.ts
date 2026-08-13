import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAccessToken(who: "paris" | "raleigh"): Promise<string | null> {
  const { data, error } = await supabase
    .from("spotify_tokens")
    .select("*")
    .eq("who", who)
    .maybeSingle();

  if (error || !data || !data.refresh_token) {
    return null;
  }

  // Vérifier si l'access token est encore valide (avec 1 min de marge)
  const isExpired = new Date(data.expires_at).getTime() - 60000 < Date.now();

  if (!isExpired && data.access_token) {
    return data.access_token;
  }

  // Rafraîchir le token
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: data.refresh_token,
      }),
    });

    if (!tokenRes.ok) return null;

    const tokens = await tokenRes.json();
    const newAccessToken = tokens.access_token;
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase.from("spotify_tokens").update({
      access_token: newAccessToken,
      expires_at: expiresAt,
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
    }).eq("who", who);

    return newAccessToken;
  } catch {
    return null;
  }
}

async function fetchUserPlaying(who: "paris" | "raleigh") {
  const token = await getAccessToken(who);
  if (!token) {
    return { connected: false, isPlaying: false };
  }

  try {
    // 1. Essayer currently-playing
    const currentRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (currentRes.status === 200) {
      const current = await currentRes.json();
      if (current && current.item && current.is_playing) {
        return {
          connected: true,
          isPlaying: true,
          title: current.item.name,
          artist: current.item.artists.map((a: { name: string }) => a.name).join(", "),
          album: current.item.album.name,
          albumArt: current.item.album.images[0]?.url,
          songUrl: current.item.external_urls.spotify,
          progressMs: current.progress_ms,
          durationMs: current.item.duration_ms,
        };
      }
    }

    // 2. Si rien en cours, récupérer le dernier titre écouté
    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (recentRes.status === 200) {
      const recent = await recentRes.json();
      const lastItem = recent.items?.[0]?.track;
      if (lastItem) {
        return {
          connected: true,
          isPlaying: false,
          title: lastItem.name,
          artist: lastItem.artists.map((a: { name: string }) => a.name).join(", "),
          album: lastItem.album.name,
          albumArt: lastItem.album.images[0]?.url,
          songUrl: lastItem.external_urls.spotify,
          playedAt: recent.items[0].played_at,
        };
      }
    }

    return { connected: true, isPlaying: false };
  } catch {
    return { connected: false, isPlaying: false };
  }
}

export async function GET() {
  const [paris, raleigh] = await Promise.all([
    fetchUserPlaying("paris"),
    fetchUserPlaying("raleigh"),
  ]);

  return NextResponse.json({ paris, raleigh });
}
