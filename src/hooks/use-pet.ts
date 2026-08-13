"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  TREAT_COOLDOWN_MS,
  type MealSource,
  type PetRow,
  type PetType,
  type Species,
} from "@/lib/pet-data";
import type { Identity } from "@/types";

/** Doit correspondre au garde-fou des fonctions dev_* dans supabase/schema.sql. */
const DEV_PASSPHRASE = "dev-us-together";

/**
 * Données & logique du Module 7 — la créature partagée.
 *
 *  - charge la ligne unique de `public.pet`
 *  - temps réel : écoute les UPDATE (l'autre la nourrit → ça bouge ici)
 *  - `treat()`   : friandise manuelle (recharge de 4 h côté serveur)
 *  - `rename()`  : lui donner un prénom
 *  - `justHatched` : passe à true à l'instant où l'œuf éclôt, pour la cérémonie
 *
 * Le nourrissage automatique (pensées, journal) est fait par des triggers
 * en base : rien à faire ici, l'UPDATE arrive tout seul en temps réel.
 */

interface UsePet {
  pet: PetRow | null;
  loading: boolean;
  /** Erreur de chargement — typiquement : le SQL n'a pas encore été lancé */
  missing: boolean;
  connected: boolean;
  working: boolean;
  /** L'œuf vient d'éclore sous nos yeux → déclenche l'overlay de cérémonie */
  justHatched: boolean;
  dismissHatch: () => void;
  /** Millisecondes restantes avant la prochaine friandise (0 = disponible) */
  treatCooldownMs: number;
  treat: () => Promise<void>;
  rename: (name: string) => Promise<void>;

  /* ── Réservé au panneau de test (absent du build de production) ── */
  /** Nourrir à la place de l'un ou l'autre : c'est ce qui permet de tester seul */
  devFeedAs: (
    who: Identity,
    amount: number,
    source?: MealSource
  ) => Promise<void>;
  devReset: () => Promise<void>;
  devSet: (args: {
    xp?: number;
    species?: Species;
    hoursSinceFed?: number;
    type?: PetType;
  }) => Promise<void>;
}

export function usePet(identity: Identity | null): UsePet {
  const [pet, setPet] = useState<PetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [working, setWorking] = useState(false);
  const [justHatched, setJustHatched] = useState(false);

  // Espèce connue au rendu précédent : sert à détecter l'éclosion
  const previousSpecies = useRef<string | null>(null);
  const initialised = useRef(false);

  /** Applique une nouvelle ligne et détecte le passage œuf → animal. */
  const applyRow = useCallback((row: PetRow) => {
    // On ne fête l'éclosion que si on a déjà vu l'œuf sans espèce.
    // Sans ce garde-fou, arriver sur le site après l'éclosion rejouerait
    // la cérémonie à chaque chargement.
    if (initialised.current && !previousSpecies.current && row.species) {
      setJustHatched(true);
    }
    previousSpecies.current = row.species;
    initialised.current = true;
    setPet(row);
  }, []);

  // ── Chargement initial ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("pet")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        // Table absente ou vide → le SQL n'a pas été exécuté
        setMissing(true);
      } else {
        applyRow(data as PetRow);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyRow]);

  // ── Temps réel : la créature bouge des deux côtés ──
  useEffect(() => {
    const channel = supabase
      .channel("pet-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pet" },
        (payload) => applyRow(payload.new as PetRow)
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [applyRow]);

  // ── Recharge de la friandise ──
  // Instant où la friandise redevient disponible, d'après la base.
  const lastTreat = !pet
    ? null
    : identity === "paris"
      ? pet.last_treat_paris
      : identity === "raleigh"
        ? pet.last_treat_raleigh
        : null;

  const readyAt = lastTreat
    ? new Date(lastTreat).getTime() + TREAT_COOLDOWN_MS
    : null;

  // Horloge locale : ne tourne QUE pendant une recharge en cours.
  // Le compte à rebours est ensuite dérivé, pas stocké — pas de setState
  // synchrone dans l'effet, et une seule source de vérité (la base).
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (readyAt === null || readyAt <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [readyAt]);

  const treatCooldownMs = readyAt === null ? 0 : Math.max(readyAt - now, 0);

  // ── Actions ──
  const treat = useCallback(async () => {
    if (!identity || working) return;
    setWorking(true);
    try {
      const { data } = await supabase.rpc("give_treat", { p_who: identity });
      if (data) applyRow(data as PetRow);
    } finally {
      setWorking(false);
    }
  }, [identity, working, applyRow]);

  const rename = useCallback(
    async (name: string) => {
      setWorking(true);
      try {
        const { data } = await supabase.rpc("name_pet", { p_name: name });
        if (data) applyRow(data as PetRow);
      } finally {
        setWorking(false);
      }
    },
    [applyRow]
  );

  const dismissHatch = useCallback(() => setJustHatched(false), []);

  /* ── Actions de test (utilisées seulement par le panneau de dev) ──
   * `devFeedAs` n'a besoin d'aucune fonction spéciale : `feed_pet` prend déjà
   * l'identité en paramètre. C'est ce qui permet de faire éclore l'œuf seul,
   * en signant à la place de l'autre. */
  const devFeedAs = useCallback(
    async (who: Identity, amount: number, source?: MealSource) => {
      setWorking(true);
      try {
        const { data } = await supabase.rpc("feed_pet", {
          p_who: who,
          p_amount: amount,
          p_key: null,
          p_source: source ?? null,
        });
        if (data) applyRow(data as PetRow);
      } finally {
        setWorking(false);
      }
    },
    [applyRow]
  );

  const devReset = useCallback(async () => {
    setWorking(true);
    try {
      const { data } = await supabase.rpc("dev_pet_reset", {
        p_confirm: DEV_PASSPHRASE,
      });
      if (data) {
        // Remise à zéro : on oublie l'espèce vue, sinon la prochaine éclosion
        // ne serait pas détectée comme un événement
        previousSpecies.current = null;
        setPet(data as PetRow);
      }
    } finally {
      setWorking(false);
    }
  }, []);

  const devSet = useCallback(
    async (args: {
      xp?: number;
      species?: Species;
      hoursSinceFed?: number;
      type?: PetType;
    }) => {
      setWorking(true);
      try {
        const { data } = await supabase.rpc("dev_pet_set", {
          p_confirm: DEV_PASSPHRASE,
          p_xp: args.xp ?? null,
          p_species: args.species ?? null,
          p_hours_since_fed: args.hoursSinceFed ?? null,
          p_type: args.type ?? null,
        });
        if (data) applyRow(data as PetRow);
      } finally {
        setWorking(false);
      }
    },
    [applyRow]
  );

  return {
    pet,
    loading,
    missing,
    connected,
    working,
    justHatched,
    dismissHatch,
    treatCooldownMs,
    treat,
    rename,
    devFeedAs,
    devReset,
    devSet,
  };
}

/**
 * Version minimale, sans souscription : sert à NOURRIR depuis les autres
 * modules (lettre lue, journée passée en ligne ensemble) sans monter
 * toute la logique de la créature.
 *
 * `key` rend le repas unique : la base ignore un doublon, donc relire
 * dix fois la même lettre ne compte qu'une fois.
 */
export function usePetFeeder(identity: Identity | null) {
  return useCallback(
    async (amount: number, key?: string | null, source?: MealSource) => {
      if (!identity) return;
      // Silencieux par conception : si le SQL n'est pas encore passé, on ne
      // veut pas casser la lecture d'une lettre pour autant.
      await supabase
        .rpc("feed_pet", {
          p_who: identity,
          p_amount: amount,
          p_key: key ?? null,
          p_source: source ?? null,
        })
        .then(undefined, () => undefined);
    },
    [identity]
  );
}
