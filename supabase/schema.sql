-- ════════════════════════════════════════════════════════════════════════
--  us-together — SCHÉMA COMPLET
--
--  À coller EN ENTIER dans le SQL Editor Supabase, puis « Run » :
--  https://supabase.com/dashboard/project/tqwtyrkozrxvrtsxjfpq/sql/new
--
--  ⚠️ Le dashboard pousse souvent vers la page « Connect » (CLI / SSR auth).
--     Ce n'est PAS ça : il faut le SQL Editor, lien ci-dessus.
--
--  Ce fichier est REJOUABLE : tout est en « if not exists » / « or replace »,
--  et les ajouts à la publication temps réel sont protégés. Le relancer ne
--  casse rien et n'efface aucune donnée.
--
--  Le site n'a pas d'authentification (deux personnes, lien privé) : les
--  policies sont permissives par conception. Les écritures sensibles (la
--  créature) passent quand même par des fonctions, pour que le navigateur
--  ne puisse pas trafiquer les compteurs.
--
--  Contenu :
--    1. thoughts        — Module 3, « Thinking of you »
--    2. journal_entries — Module 5, journal + Storage photos/voix
--    3. pet             — Module 7, la créature partagée
--    4. remise à zéro de l'œuf (commentée, pour tester)
-- ════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════
--  1. MODULE 3 — LES PENSÉES
--  Déjà en place sur ce projet ; repris ici pour que ce fichier soit le
--  schéma complet (utile en cas de nouveau projet Supabase).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.thoughts (
  id         uuid        primary key default gen_random_uuid(),
  sender     text        not null check (sender in ('paris', 'raleigh')),
  created_at timestamptz not null default now()
);

alter table public.thoughts enable row level security;

drop policy if exists "thoughts lecture publique" on public.thoughts;
create policy "thoughts lecture publique"
  on public.thoughts for select using (true);

drop policy if exists "thoughts insertion publique" on public.thoughts;
create policy "thoughts insertion publique"
  on public.thoughts for insert with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'thoughts'
  ) then
    alter publication supabase_realtime add table public.thoughts;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
--  2. MODULE 5 — JOURNAL & CAPSULE TEMPORELLE
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.journal_entries (
  id         uuid        primary key default gen_random_uuid(),
  author     text        not null check (author in ('paris', 'raleigh')),
  kind       text        not null check (kind in ('text', 'photo', 'voice')),
  body       text,
  media_path text,
  created_at timestamptz not null default now()
);

-- Le fil est toujours lu par date décroissante
create index if not exists journal_entries_created_at_idx
  on public.journal_entries (created_at desc);

alter table public.journal_entries enable row level security;

drop policy if exists "journal lecture publique" on public.journal_entries;
create policy "journal lecture publique"
  on public.journal_entries for select using (true);

drop policy if exists "journal insertion publique" on public.journal_entries;
create policy "journal insertion publique"
  on public.journal_entries for insert with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'journal_entries'
  ) then
    alter publication supabase_realtime add table public.journal_entries;
  end if;
end $$;

-- ── STORAGE : photos et notes vocales ──
-- Bucket PUBLIC : les médias sont joignables par URL non devinable (UUID).
-- Compromis assumé pour un site perso — pas d'URL signée à gérer.
insert into storage.buckets (id, name, public)
values ('journal', 'journal', true)
on conflict (id) do update set public = true;

drop policy if exists "journal media lecture" on storage.objects;
create policy "journal media lecture"
  on storage.objects for select
  using (bucket_id = 'journal');

drop policy if exists "journal media upload" on storage.objects;
create policy "journal media upload"
  on storage.objects for insert
  with check (bucket_id = 'journal');


-- ════════════════════════════════════════════════════════════════════════
--  3. MODULE 7 — LA CRÉATURE PARTAGÉE (œuf → animal à nourrir)
--
--  UNE seule créature pour vous deux (table à ligne unique).
--  Nourrie par vos gestes réels — pensée envoyée, entrée de journal, lettre
--  lue, journée passée en ligne en même temps — plus une friandise manuelle
--  avec 4 h de recharge.
--  L'œuf n'éclôt que quand VOUS DEUX l'avez nourri au moins une fois.
--  Elle ne meurt jamais et ne perd jamais de points : au pire elle dort.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.pet (
  id                 int         primary key default 1,
  -- null tant que l'œuf n'a pas éclos ; tirée au sort à l'éclosion
  species            text        check (species in ('renard', 'chat', 'axolotl', 'hibou')),
  -- nourriture cumulée : ne descend JAMAIS
  xp                 int         not null default 0,
  fed_by_paris       boolean     not null default false,
  fed_by_raleigh     boolean     not null default false,
  name               text,
  hatched_at         timestamptz,
  last_fed_at        timestamptz,
  last_fed_by        text,
  last_treat_paris   timestamptz,
  last_treat_raleigh timestamptz,
  created_at         timestamptz not null default now(),
  constraint pet_singleton check (id = 1)
);

insert into public.pet (id) values (1) on conflict (id) do nothing;

-- ── LA NATURE (feu, eau, foudre…) et les compteurs de régime ──
-- Ajoutés après coup : « add column if not exists » met à niveau une base
-- déjà en service sans rien effacer.
--
-- L'espèce donne la silhouette, la NATURE donne la palette et les ornements.
-- Elle n'est pas tirée au sort : elle est déduite de la façon dont vous l'avez
-- nourrie. Elle reste nulle jusqu'à la première évolution.
alter table public.pet
  add column if not exists type text
    check (type in ('ardent', 'onde', 'foudre', 'sylve', 'spectre', 'astral'));

alter table public.pet add column if not exists meals_thought  int not null default 0;
alter table public.pet add column if not exists meals_journal  int not null default 0;
alter table public.pet add column if not exists meals_letter   int not null default 0;
alter table public.pet add column if not exists meals_together int not null default 0;
alter table public.pet add column if not exists meals_treat    int not null default 0;

-- Repas à usage unique, pour ne pas les compter deux fois.
-- Clés : 'letter:<id-enveloppe>', 'together:<AAAA-MM-JJ>'
create table if not exists public.pet_events (
  key        text        primary key,
  who        text,
  amount     int         not null,
  created_at timestamptz not null default now()
);

alter table public.pet        enable row level security;
alter table public.pet_events enable row level security;

drop policy if exists "pet lecture publique" on public.pet;
create policy "pet lecture publique"
  on public.pet for select using (true);

drop policy if exists "pet events lecture publique" on public.pet_events;
create policy "pet events lecture publique"
  on public.pet_events for select using (true);

-- Volontairement AUCUNE policy insert/update : les fonctions ci-dessous sont
-- en SECURITY DEFINER et contournent RLS. Le navigateur ne peut donc pas
-- mettre xp à 9999 ni faire éclore l'œuf tout seul.

-- ── Le stade, déduit de l'expérience (doit suivre STAGE_XP dans pet-data.ts) ──
create or replace function public.pet_stage(p_species text, p_xp int)
returns text
language sql
immutable
as $$
  select case
    when p_species is null then 'egg'
    when p_xp >= 120       then 'adult'
    when p_xp >= 40        then 'teen'
    else 'baby'
  end;
$$;

-- ── LA NATURE, déduite du régime ──
-- Pondérée par l'expérience apportée, pas par le nombre de repas : une journée
-- passée ensemble vaut 6 quand une pensée vaut 2.
-- Un régime doit peser plus de 35 % pour imposer sa nature ; sinon aucune
-- habitude ne domine → 'astral'.
-- ⚠️ Doit rester aligné sur `predictType` dans src/lib/pet-data.ts.
create or replace function public.pet_compute_type(p_pet public.pet)
returns text
language plpgsql
immutable
as $$
declare
  v_total int;
  v_best  text;
  v_score int;
begin
  v_total := p_pet.meals_thought  * 2
           + p_pet.meals_journal  * 3
           + p_pet.meals_letter   * 4
           + p_pet.meals_together * 6
           + p_pet.meals_treat    * 5;

  if v_total = 0 then
    return 'astral';
  end if;

  select t.nature, t.score
    into v_best, v_score
    from (
      values
        ('ardent',  p_pet.meals_thought  * 2),
        ('sylve',   p_pet.meals_journal  * 3),
        ('spectre', p_pet.meals_letter   * 4),
        ('foudre',  p_pet.meals_together * 6),
        ('onde',    p_pet.meals_treat    * 5)
    ) as t(nature, score)
   order by t.score desc
   limit 1;

  if v_score::numeric / v_total < 0.35 then
    return 'astral';
  end if;

  return v_best;
end;
$$;

-- ── Nourrir ──
-- `p_source` sert à tenir les compteurs de régime, donc à décider de la nature.
create or replace function public.feed_pet(
  p_who    text,
  p_amount int  default 2,
  p_key    text default null,
  p_source text default null
)
returns public.pet
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pet          public.pet;
  v_species      text;
  v_stage_before text;
  v_stage_after  text;
begin
  if p_who not in ('paris', 'raleigh') then
    raise exception 'identité inconnue: %', p_who;
  end if;

  if p_source is not null
     and p_source not in ('thought', 'journal', 'letter', 'together', 'treat') then
    raise exception 'régime inconnu: %', p_source;
  end if;

  -- Repas à usage unique : si la clé existe déjà, on ne recompte pas
  if p_key is not null then
    insert into public.pet_events (key, who, amount)
    values (p_key, p_who, greatest(p_amount, 0))
    on conflict (key) do nothing;

    if not found then
      select * into v_pet from public.pet where id = 1;
      return v_pet;
    end if;
  end if;

  select public.pet_stage(species, xp) into v_stage_before
    from public.pet where id = 1;

  update public.pet
     set xp             = xp + greatest(p_amount, 0),
         last_fed_at    = now(),
         last_fed_by    = p_who,
         fed_by_paris   = fed_by_paris   or (p_who = 'paris'),
         fed_by_raleigh = fed_by_raleigh or (p_who = 'raleigh'),
         meals_thought  = meals_thought  + (case when p_source = 'thought'  then 1 else 0 end),
         meals_journal  = meals_journal  + (case when p_source = 'journal'  then 1 else 0 end),
         meals_letter   = meals_letter   + (case when p_source = 'letter'   then 1 else 0 end),
         meals_together = meals_together + (case when p_source = 'together' then 1 else 0 end),
         meals_treat    = meals_treat    + (case when p_source = 'treat'    then 1 else 0 end)
   where id = 1
  returning * into v_pet;

  -- ÉCLOSION : il faut que vous l'ayez nourri tous les deux
  if v_pet.species is null and v_pet.fed_by_paris and v_pet.fed_by_raleigh then
    v_species := (array['renard', 'chat', 'axolotl', 'hibou'])
                 [(1 + floor(random() * 4))::int];
    update public.pet
       set species    = v_species,
           hatched_at = now()
     where id = 1
    returning * into v_pet;
  end if;

  -- ÉVOLUTION : à chaque changement de stade, la nature est (ré)évaluée.
  -- Deux occasions donc : bébé → ado la révèle, ado → adulte peut la CHANGER
  -- si vos habitudes ont changé entre-temps.
  v_stage_after := public.pet_stage(v_pet.species, v_pet.xp);

  if v_stage_after <> v_stage_before
     and v_stage_after not in ('egg')
     and v_stage_before <> 'egg' then
    update public.pet
       set type = public.pet_compute_type(v_pet)
     where id = 1
    returning * into v_pet;
  end if;

  return v_pet;
end;
$$;

-- ── Friandise manuelle : recharge de 4 h, vérifiée côté serveur ──
-- (côté serveur = la recharge suit la personne, pas l'appareil)
create or replace function public.give_treat(p_who text)
returns public.pet
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_pet  public.pet;
begin
  if p_who not in ('paris', 'raleigh') then
    raise exception 'identité inconnue: %', p_who;
  end if;

  select case when p_who = 'paris' then last_treat_paris
                                   else last_treat_raleigh end
    into v_last
    from public.pet where id = 1;

  -- Encore en recharge → on ne fait rien, et sans lever d'erreur
  if v_last is not null and v_last > now() - interval '4 hours' then
    select * into v_pet from public.pet where id = 1;
    return v_pet;
  end if;

  if p_who = 'paris' then
    update public.pet set last_treat_paris = now() where id = 1;
  else
    update public.pet set last_treat_raleigh = now() where id = 1;
  end if;

  return public.feed_pet(p_who, 5, null::text, 'treat');
end;
$$;

-- ── Lui donner un prénom (renommable à volonté) ──
create or replace function public.name_pet(p_name text)
returns public.pet
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pet public.pet;
begin
  update public.pet
     set name = nullif(btrim(p_name), '')
   where id = 1
  returning * into v_pet;
  return v_pet;
end;
$$;

-- ── Nourrissage automatique par vos gestes existants ──
-- Fait côté base : ça compte même si l'onglet de l'autre est fermé.

-- Une pensée envoyée = +2
create or replace function public.pet_feed_on_thought()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.feed_pet(new.sender, 2, null::text, 'thought');
  return new;
end;
$$;

drop trigger if exists pet_feed_thought on public.thoughts;
create trigger pet_feed_thought
  after insert on public.thoughts
  for each row execute function public.pet_feed_on_thought();

-- Une entrée de journal = +3 (texte, photo ou note vocale)
create or replace function public.pet_feed_on_journal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.feed_pet(new.author, 3, null::text, 'journal');
  return new;
end;
$$;

drop trigger if exists pet_feed_journal on public.journal_entries;
create trigger pet_feed_journal
  after insert on public.journal_entries
  for each row execute function public.pet_feed_on_journal();

-- Temps réel : l'autre voit la créature grandir en direct
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'pet'
  ) then
    alter publication supabase_realtime add table public.pet;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
--  4. OUTILS DE TEST
--
--  Le panneau de test du site (visible uniquement en `npm run dev`) s'appuie
--  sur ces deux fonctions. Elles permettent de tester la créature SEUL :
--  faire éclore l'œuf sans attendre l'autre personne, sauter aux stades ado
--  et adulte, la faire dormir, tout remettre à zéro.
--
--  Elles exigent une phrase de confirmation pour ne pas être déclenchées par
--  accident. Ce n'est PAS une sécurité : qui possède la clé publique peut les
--  appeler. C'est acceptable ici (site privé à deux, et le pire cas est un œuf
--  remis à zéro — ni le journal ni les pensées ne sont touchés).
--  ⚠️ Avant de partager le lien pour de bon, exécute le bloc DROP en fin de
--     fichier : le panneau disparaît du build de production, mais pas elles.
-- ════════════════════════════════════════════════════════════════════════

-- ── Tout remettre à zéro : l'œuf redevient neuf ──
create or replace function public.dev_pet_reset(p_confirm text)
returns public.pet
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pet public.pet;
begin
  if p_confirm <> 'dev-us-together' then
    raise exception 'phrase de confirmation invalide';
  end if;

  update public.pet
     set species            = null,
         xp                 = 0,
         fed_by_paris       = false,
         fed_by_raleigh     = false,
         name               = null,
         hatched_at         = null,
         last_fed_at        = null,
         last_fed_by        = null,
         last_treat_paris   = null,
         last_treat_raleigh = null,
         type               = null,
         meals_thought      = 0,
         meals_journal      = 0,
         meals_letter       = 0,
         meals_together     = 0,
         meals_treat        = 0
   where id = 1
  returning * into v_pet;

  -- Sinon les repas à usage unique (lettres lues) resteraient consommés
  delete from public.pet_events where true;

  return v_pet;
end;
$$;

-- ── Forcer un état précis : seuls les paramètres non nuls sont appliqués ──
--  p_xp              → saute à un stade (40 = ado, 120 = adulte)
--  p_species         → impose l'espèce ; déclenche la cérémonie d'éclosion
--  p_hours_since_fed → recule le dernier repas (> 48 = endormie)
create or replace function public.dev_pet_set(
  p_confirm         text,
  p_xp              int  default null,
  p_species         text default null,
  p_hours_since_fed int  default null,
  p_type            text default null
)
returns public.pet
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pet public.pet;
begin
  if p_confirm <> 'dev-us-together' then
    raise exception 'phrase de confirmation invalide';
  end if;

  update public.pet
     set xp          = coalesce(p_xp, xp),
         species     = coalesce(p_species, species),
         type        = coalesce(p_type, type),
         -- Poser une espèce vaut éclosion : on date la naissance
         hatched_at  = case
                         when p_species is not null and hatched_at is null then now()
                         else hatched_at
                       end,
         -- Nourrir "dans le passé" pour tester l'assoupissement
         last_fed_at = case
                         when p_hours_since_fed is not null
                           then now() - make_interval(hours => p_hours_since_fed)
                         else last_fed_at
                       end
   where id = 1
  returning * into v_pet;

  return v_pet;
end;
$$;


-- ════════════════════════════════════════════════════════════════════════
--  5. AVANT LA MISE EN LIGNE — retirer les outils de test
--  À décommenter et exécuter quand le site part pour de vrai.
-- ════════════════════════════════════════════════════════════════════════
-- drop function if exists public.dev_pet_reset(text);
-- drop function if exists public.dev_pet_set(text, int, text, int, text);


-- ════════════════════════════════════════════════════════════════════════
--  6. MODULE 8 — LA SALLE DE SPORT RPG (Arthur & Clara)
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.gym_sessions (
  id         uuid        primary key default gen_random_uuid(),
  who        text        not null check (who in ('paris', 'raleigh')),
  type       text        not null check (type in ('push', 'pull', 'legs', 'cardio')),
  notes      text,
  created_at timestamptz not null default now()
);

alter table public.gym_sessions enable row level security;

drop policy if exists "gym_sessions lecture publique" on public.gym_sessions;
create policy "gym_sessions lecture publique"
  on public.gym_sessions for select using (true);

drop policy if exists "gym_sessions insertion publique" on public.gym_sessions;
create policy "gym_sessions insertion publique"
  on public.gym_sessions for insert with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'gym_sessions'
  ) then
    alter publication supabase_realtime add table public.gym_sessions;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
--  7. SPOTIFY NOW PLAYING — TOKENS D'AUTHENTIFICATION
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.spotify_tokens (
  who           text        primary key check (who in ('paris', 'raleigh')),
  access_token  text        not null,
  refresh_token text        not null,
  expires_at    timestamptz not null,
  updated_at    timestamptz not null default now()
);

alter table public.spotify_tokens enable row level security;

drop policy if exists "spotify_tokens lecture publique" on public.spotify_tokens;
create policy "spotify_tokens lecture publique"
  on public.spotify_tokens for select using (true);

drop policy if exists "spotify_tokens insertion publique" on public.spotify_tokens;
create policy "spotify_tokens insertion publique"
  on public.spotify_tokens for insert with check (true);

drop policy if exists "spotify_tokens update publique" on public.spotify_tokens;
create policy "spotify_tokens update publique"
  on public.spotify_tokens for update using (true);


