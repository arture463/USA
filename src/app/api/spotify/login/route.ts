import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/spotify/login?who=paris|raleigh
 * Redirige vers la page d'autorisation Spotify OAuth 2.0
 */
export async function GET(req: NextRequest) {
  const who = req.nextUrl.searchParams.get("who") || "paris";

  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    `${req.nextUrl.origin}/api/spotify/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: "user-read-currently-playing user-read-recently-played",
    redirect_uri: redirectUri,
    state: who,
    show_dialog: "true",
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
