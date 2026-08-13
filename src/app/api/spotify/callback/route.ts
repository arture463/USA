import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/spotify/callback?code=...&state=paris|raleigh
 * Échange le code d'autorisation contre un access_token + refresh_token
 * et les stocke dans Supabase pour une utilisation future.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const who = req.nextUrl.searchParams.get("state") || "paris";
  const error = req.nextUrl.searchParams.get("error");

  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    `${req.nextUrl.origin}/api/spotify/callback`;

  if (error || !code) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/?spotify_error=${error || "no_code"}`
    );
  }

  // Échange du code contre des tokens
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/?spotify_error=token_exchange_failed`
    );
  }

  const tokens = await tokenRes.json();

  // Stocker en Supabase (upsert : remplace si déjà connecté)
  await supabase.from("spotify_tokens").upsert(
    {
      who,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    },
    { onConflict: "who" }
  );

  // Rediriger vers le site avec un message de succès
  return NextResponse.redirect(
    `${req.nextUrl.origin}/?spotify_connected=${who}`
  );
}
