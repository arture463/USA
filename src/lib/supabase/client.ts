import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase pour le navigateur (singleton).
 *
 * Pas d'authentification ici : le site est privé et repose sur des
 * policies RLS permissives. On se sert surtout du moteur Realtime.
 *
 * Les variables NEXT_PUBLIC_* sont injectées au build par Next.js.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Message explicite si le .env.local est absent / mal nommé
  throw new Error(
    "Supabase : variables manquantes. Vérifie NEXT_PUBLIC_SUPABASE_URL et " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local, puis relance `npm run dev`."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }, // pas de session : usage anonyme
  realtime: { params: { eventsPerSecond: 10 } },
});
