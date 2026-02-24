# Projekt AI

Narzędzie szkoleniowe z agentami AI dla edukatorów.

## Stack

- **Next.js** (App Router) — framework
- **Supabase** — baza danych + auth
- **OpenAI API** — agenci tekstowi (narzędzia A-D)
- **ElevenLabs API** — agent głosowy (narzędzie E)
- **Tailwind CSS** — stylowanie
- **Vercel** — deploy

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Konfiguracja

Utwórz plik `.env.local` i uzupełnij:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Baza danych

Schema SQL do uruchomienia w Supabase znajduje się w `supabase/schema.sql`.

## Struktura projektu

```
src/
├── app/
│   ├── dashboard/       — panel uczestnika
│   ├── tools/[toolId]/  — strony narzędzi A-E
│   ├── layout.tsx       — główny layout
│   ├── page.tsx         — strona logowania
│   └── providers.tsx    — context providers
├── components/
│   ├── LoginForm.tsx    — formularz logowania
│   └── ToolCard.tsx     — karta narzędzia
├── context/
│   └── AuthContext.tsx  — kontekst autoryzacji
├── lib/
│   ├── supabase.ts     — klient Supabase
│   └── tools.ts        — definicje narzędzi
└── types/
    └── database.ts     — typy bazy danych
```
