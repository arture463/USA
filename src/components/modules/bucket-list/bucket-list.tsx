"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, Plus, HeartHandshake, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { revealOnScroll } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { useIdentity } from "@/hooks/use-identity";
import { supabase } from "@/lib/supabase/client";
import { playObjectiveCompleteSound } from "@/lib/sound-fx";

export interface BucketListItem {
  id: string;
  text: string;
  completed: boolean;
  addedBy?: "paris" | "raleigh";
  created_at?: string;
}

const DEFAULT_ITEMS: BucketListItem[] = [
  {
    id: "item-1",
    text: "✈️ Retrouvailles à l'aéroport avec un câlin qui dure au moins 5 minutes",
    completed: false,
    addedBy: "paris",
  },
  {
    id: "item-2",
    text: "🎄 Déballer les cadeaux ensemble sous le sapin le 24 Décembre au soir",
    completed: false,
    addedBy: "raleigh",
  },
  {
    id: "item-3",
    text: "🧀 Soirée Fondue / Raclette géante avec chocolat chaud au coin du feu",
    completed: false,
    addedBy: "paris",
  },
  {
    id: "item-4",
    text: "🍿 Marathon de films sous un plaid moelleux sans regarder l'heure",
    completed: false,
    addedBy: "raleigh",
  },
  {
    id: "item-5",
    text: "✨ Balade main dans la main dans Paris illuminé pour Noël",
    completed: false,
    addedBy: "paris",
  },
  {
    id: "item-6",
    text: "📸 Prendre notre première vraie photo ensemble depuis 4 mois",
    completed: false,
    addedBy: "raleigh",
  },
];

const STORAGE_KEY = "us-together:bucket-list";

/** Fusionne les items chargés avec les objectifs par défaut pour ne rien perdre */
function mergeBucketItems(raw: BucketListItem[]): BucketListItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_ITEMS;

  const result: BucketListItem[] = [];
  const processedDefaultIds = new Set<string>();

  for (const item of raw) {
    if (!item || !item.id || !item.text) continue;
    result.push(item);
    if (item.id.startsWith("item-")) {
      processedDefaultIds.add(item.id);
    }
  }

  for (const def of DEFAULT_ITEMS) {
    if (!processedDefaultIds.has(def.id)) {
      result.push(def);
    }
  }

  return result;
}

export function BucketList() {
  const { identity } = useIdentity();
  const [items, setItems] = useState<BucketListItem[]>(DEFAULT_ITEMS);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  // Charger les items depuis Supabase ou LocalStorage
  const fetchItems = useCallback(async () => {
    try {
      // 1. Priorité au snapshot d'état BUCKET_STATE
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("kind", "text")
        .like("body", "BUCKET_STATE:%")
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].body) {
        const parsed = JSON.parse(data[0].body.replace("BUCKET_STATE:", ""));
        const merged = mergeBucketItems(parsed);
        setItems(merged);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return;
      }

      // 2. Rétrocompatibilité avec les anciennes entrées LIST:
      const { data: legacyData } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("kind", "text")
        .like("body", "LIST:%")
        .order("created_at", { ascending: true });

      if (legacyData && legacyData.length > 0) {
        const legacyItems: BucketListItem[] = legacyData.map((r) => {
          const raw = r.body?.replace("LIST:", "") || "";
          const isDone = raw.startsWith("DONE:");
          const text = isDone ? raw.replace("DONE:", "") : raw.replace("TODO:", "");
          return {
            id: r.id,
            text,
            completed: isDone,
            addedBy: r.author,
            created_at: r.created_at,
          };
        });
        const merged = mergeBucketItems(legacyItems);
        setItems(merged);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return;
      }

      // 3. Fallback LocalStorage ou Défauts
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) {
        setItems(mergeBucketItems(JSON.parse(local)));
      } else {
        setItems(DEFAULT_ITEMS);
      }
    } catch {
      const local = window.localStorage.getItem(STORAGE_KEY);
      if (local) {
        setItems(mergeBucketItems(JSON.parse(local)));
      } else {
        setItems(DEFAULT_ITEMS);
      }
    }
  }, []);

  useEffect(() => {
    void fetchItems();

    // Écoute Realtime de la Bucket List partagée
    const channel = supabase
      .channel("realtime:bucket_list_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "journal_entries" },
        (payload) => {
          const entry = payload.new as { body?: string; author?: string };
          if (entry?.body && entry.body.startsWith("BUCKET_STATE:")) {
            try {
              const parsed = JSON.parse(entry.body.replace("BUCKET_STATE:", ""));
              const merged = mergeBucketItems(parsed);
              setItems(merged);
              try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {}
            } catch {}
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const saveAndSync = async (next: BucketListItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}

    try {
      await supabase.from("journal_entries").insert({
        author: identity ?? "paris",
        kind: "text",
        body: `BUCKET_STATE:${JSON.stringify(next)}`,
      });
    } catch (err) {
      console.error("Erreur de synchronisation de la Bucket List :", err);
    }
  };

  // Cocher / Décocher un item
  const toggleItem = async (item: BucketListItem) => {
    const nextCompleted = !item.completed;
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, completed: nextCompleted } : i
    );

    if (nextCompleted) {
      playObjectiveCompleteSound();
      void confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    await saveAndSync(updated);
  };

  // Ajouter un nouvel item personnalisé
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const text = newText.trim();
    const newItem: BucketListItem = {
      id: `list-${Date.now()}`,
      text,
      completed: false,
      addedBy: identity ?? "paris",
      created_at: new Date().toISOString(),
    };

    const next = [...items, newItem];
    setNewText("");
    setAdding(false);
    await saveAndSync(next);
  };

  // Supprimer un item
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const next = items.filter((i) => i.id !== id);
    await saveAndSync(next);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const percent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <motion.section {...revealOnScroll} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeading
          eyebrow="Retrouvailles 24 Décembre 🎄"
          icon={HeartHandshake}
          title="Bucket List"
          titleAccent="des retrouvailles"
          subtitle="Toutes les petites et grandes choses qu'on va faire ensemble dès son retour !"
          accent="rose"
          className="mb-0"
        />

        <button
          type="button"
          onClick={() => setAdding((prev) => !prev)}
          className="btn-neon btn-sm btn-pill shrink-0 gap-1.5 text-xs border-neon-rose/50 text-neon-rose hover:border-neon-rose shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une envie
        </button>
      </div>

      <div className="panel-roomy space-y-5">
        {/* Formulaire d'ajout rapide */}
        <AnimatePresence>
          {adding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddItem}
              className="overflow-hidden space-y-2 border-b border-white/10 pb-4"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="ex: Aller manger une vraie gaufre sur les grands boulevards 🧇"
                  className="field flex-1 text-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-neon btn-sm bg-neon-rose text-white border-neon-rose text-xs"
                >
                  Ajouter 💫
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Barre de progression des envies */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-foreground/70">
            <span className="flex items-center gap-1 font-semibold text-neon-rose">
              <Sparkles className="h-3.5 w-3.5" />
              {completedCount} sur {items.length} réalisés ({percent}%)
            </span>
            <span>24 Décembre 🎁</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-rose via-neon-violet to-neon-cyan shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Liste interactive des éléments */}
        <div className="space-y-2.5 pt-2">
          {items.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => void toggleItem(item)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              className={`group w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                item.completed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-foreground/60 line-through"
                  : "border-white/10 bg-white/5 hover:border-white/20 text-foreground/90"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-foreground/30" />
                )}
                <span className="text-xs sm:text-sm font-medium leading-relaxed">
                  {item.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.addedBy && (
                  <span className="font-mono text-[10px] rounded-full bg-white/10 px-2 py-0.5 text-foreground/50">
                    {item.addedBy === "paris" ? "Arthur 🇫🇷" : "Clara 🇺🇸"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => void handleDeleteItem(e, item.id)}
                  className="p-1.5 text-foreground/30 hover:text-rose-400 hover:bg-rose-500/15 rounded-md transition-all flex items-center justify-center"
                  title="Supprimer cette envie"
                  aria-label="Supprimer cette envie"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
