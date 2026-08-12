# Continuer le projet sur un autre PC

Tout ce qu'il faut savoir pour reprendre `us-together` ailleurs.
Compte environ 10 minutes la première fois.

---

## Ce qu'il faut emporter (et surtout ce qu'il ne faut pas)

| Dossier | Poids | Emporter ? |
|---|---|---|
| Le code (81 fichiers) | ~4 Mo | **oui** |
| `node_modules` | 654 Mo | **non** — se réinstalle tout seul |
| `.next` | 388 Mo | **non** — se régénère au premier lancement |
| `.env.local` | 2 lignes | **oui**, mais à la main (voir plus bas) |

Copier `node_modules` est la erreur classique : c'est long, ça pèse 150 fois
le projet, et ça peut même casser (certains paquets sont compilés pour la
machine sur laquelle ils ont été installés).

---

## Méthode A — clé USB ou cloud (le plus simple, sans compte)

### Sur ce PC

1. Ouvre `C:\Users\ArthurLegas\Downloads\USA\`
2. Copie le dossier `us-together` sur ta clé / ton Drive
3. **Supprime `node_modules` et `.next` de la copie** — pas de l'original !

Ou en une commande, qui fait la copie propre toute seule :

```powershell
$src = "C:\Users\ArthurLegas\Downloads\USA\us-together"
$dst = "E:\us-together"   # ← adapte la lettre de ta clé
robocopy $src $dst /E /XD node_modules .next .git
```

### Sur l'autre PC

1. **Installe Node.js** (version LTS) : https://nodejs.org
   Vérifie dans un terminal : `node -v` doit afficher `v22` ou plus.
2. Colle le dossier, idéalement au **même chemin** :
   `C:\Users\<ton-nom>\Downloads\USA\us-together`
3. Ouvre un terminal dans le dossier et lance :

```powershell
npm install
```

4. Crée le fichier `.env.local` (voir la section dédiée)
5. Démarre :

```powershell
npm run dev
```

6. Ouvre http://localhost:3000

**Limite de cette méthode :** rien ne se synchronise. Si tu travailles sur les
deux PC, tu finiras par écraser du travail. Pour des allers-retours réguliers,
prends la méthode B.

---

## Méthode B — GitHub privé (recommandé si tu fais des allers-retours)

Ça sert aussi de sauvegarde : sans ça, si ce disque lâche, tout est perdu.

**C'est déjà configuré.** Le dépôt est :
`https://github.com/arture463/USA` (privé, branche `main`)

### Sur l'autre PC — la première fois

⚠️ **Le dépôt s'appelle `USA`, mais le dossier du projet doit s'appeler
`us-together`.** D'où le nom ajouté à la fin de la commande `clone` :
sans lui, tu obtiendrais `Downloads\USA\package.json` au lieu de
`Downloads\USA\us-together\package.json`, et tous les chemins de ce tuto
(ainsi que le dossier mémoire de Claude) ne correspondraient plus.

```powershell
mkdir C:\Users\<ton-nom>\Downloads\USA
cd C:\Users\<ton-nom>\Downloads\USA
git clone https://github.com/arture463/USA.git us-together
cd us-together
npm install
npm run dev
```

Puis crée `.env.local` (voir la section dédiée) — sans lui, rien ne démarre.

### Le rythme à prendre ensuite

Avant de commencer à travailler, où que tu sois :

```powershell
git pull
```

Quand tu as fini :

```powershell
git add -A
git commit -m "ce que j'ai fait"
git push
```

C'est tout. Les deux PC restent alignés.

---

## Le fichier `.env.local` — le seul piège

Il n'est **jamais** copié par git (c'est voulu : `.gitignore` l'exclut).
Sans lui, le site refuse de démarrer.

Crée-le à la racine du projet, avec exactement deux lignes :

```
NEXT_PUBLIC_SUPABASE_URL=https://tqwtyrkozrxvrtsxjfpq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ta clé publishable>
```

Deux façons de récupérer la clé :

- **Le plus simple :** ouvre `.env.local` sur ce PC, copie les deux lignes,
  envoie-les toi par message et recolle-les là-bas.
- **Sinon :** [Project Settings → API Keys](https://supabase.com/dashboard/project/tqwtyrkozrxvrtsxjfpq/settings/api-keys),
  prends la clé `publishable`.

⚠️ Le dashboard Supabase propose le nom `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
**Ne le suis pas** — le code lit `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Cette clé est publique par nature (elle part dans le navigateur des visiteurs),
donc la recopier n'a rien de risqué. Ce qui protège le site, ce sont les
policies RLS, pas le secret de cette clé.

---

## Supabase : rien à faire

La base est dans le cloud. Les tables, les photos du journal, la créature et
son régime sont déjà là et le resteront. Les deux PC tapent sur la même base :
si tu nourris la créature depuis l'un, l'autre le voit en temps réel.

Le schéma complet est dans `supabase/schema.sql` si tu as besoin de le
rejouer un jour — il est conçu pour être relancé sans rien casser.

---

## Garder le contexte de Claude Code

Claude garde des notes sur ce projet (les choix faits, les pièges rencontrés,
les décisions produit). Elles sont ici :

```
C:\Users\ArthurLegas\.claude\projects\C--Users-ArthurLegas-Downloads-USA\memory\
```

Copie ce dossier au même endroit sur l'autre PC pour repartir avec toute la
mémoire du projet. Le nom du dossier encode le chemin du projet — c'est pour
ça qu'il vaut mieux garder **le même chemin** (`Downloads\USA`) des deux côtés.
Si tu changes de chemin, renomme le dossier en conséquence.

---

## Si ça ne démarre pas

**`npm` n'est pas reconnu** → Node n'est pas installé, ou le terminal a été
ouvert avant l'installation. Ferme-le et rouvre-en un neuf.

**Erreur au démarrage qui parle de Supabase** → `.env.local` manque, ou la clé
est sous le mauvais nom de variable (voir plus haut).

**Le port 3000 est occupé** → un autre `npm run dev` tourne déjà quelque part.
Ferme-le, ou lance `npm run dev -- -p 3001`.

**Une erreur bizarre après un `git pull`** → une dépendance a changé :
relance `npm install`.
