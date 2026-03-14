# Trading Tracker Pro

Een persoonlijke trading tracker voor aandelen met live marktdata, technische analyse en Claude AI-inzichten.

---

## Hoe werkt de app?

```
Browser  →  Next.js (localhost:3000)  →  Yahoo Finance API (gratis)
                    ↓                          ↓
              SQLite database          Anthropic Claude API
```

De app draait **lokaal op jouw computer**. Er is geen externe server nodig. Next.js fungeert zowel als frontend (de pagina's die je ziet) als backend (de API-routes die data ophalen).

---

## Vereisten

- **Node.js** versie 18 of hoger — [nodejs.org](https://nodejs.org)
- **Git** (voor het clonen van de repository)
- **Anthropic API key** — voor de Claude AI-analyse (optioneel, rest werkt zonder)

Controleer of Node.js geïnstalleerd is:
```bash
node --version   # moet v18+ tonen
npm --version
```

---

## Installatie & opstarten

### 1. Project installeren

```bash
git clone <repo-url>
cd crookedangle
npm install
```

### 2. Omgevingsvariabelen instellen

Maak een bestand `.env.local` aan in de hoofdmap:

```env
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY="sk-ant-..."
```

> De `ANTHROPIC_API_KEY` haal je op via [console.anthropic.com](https://console.anthropic.com). Zonder deze key werkt alles behalve de AI-analyse knop.

### 3. Database aanmaken

```bash
npx prisma db push
```

Dit maakt automatisch een SQLite-bestand aan op `prisma/dev.db`. Geen aparte databaseserver nodig.

### 4. App starten

```bash
npm run dev
```

Open vervolgens je browser op: **http://localhost:3000**

---

## Waar draait de app?

De app draait **volledig lokaal** — op jouw eigen computer. Niets wordt geüpload naar een externe server.

| Onderdeel | Locatie |
|---|---|
| Web-interface | `http://localhost:3000` |
| Database | `prisma/dev.db` (bestand op je harde schijf) |
| Marktdata | Yahoo Finance (extern, gratis) |
| Wisselkoers EUR/USD | open.er-api.com (extern, gratis) |
| AI-analyse | Anthropic Claude API (extern, betaald per gebruik) |

Om de app te stoppen: druk `Ctrl+C` in de terminal.

---

## Pagina's & functies

### Dashboard (`/`)
Het startscherm. Toont:
- Totale portfoliowaarde in EUR
- Totale winst/verlies (P&L)
- Overzicht van al je posities
- Allocatie-donutchart (welk % per aandeel)
- Watchlist met live koersen

Vernieuwd automatisch elke 60 seconden.

### Portfolio (`/portfolio`)
Beheer je aandelenposities:
- Klik **"Aandeel kopen"** → zoek op naam of ticker (bv. `AAPL` of `Apple`)
- Vul het aantal aandelen en aankoopprijs in
- De app berekent automatisch je huidige waarde, winst/verlies en dagwijziging

Bij meerdere aankopen van hetzelfde aandeel wordt de gemiddelde aankoopprijs herberekend.

### AI Signalen (`/signals`)
Technische analyse van meerdere aandelen tegelijk:
- Standaard worden 10 grote aandelen geanalyseerd (AAPL, MSFT, NVDA, etc.)
- Je kunt eigen symbolen toevoegen (bv. `ASML`, `SHELL`)
- Elk aandeel krijgt een **score van -100 tot +100** en een signaal:

| Signaal | Score | Betekenis |
|---|---|---|
| STERK KOPEN | +60 tot +100 | Meerdere indicatoren bullish |
| KOPEN | +20 tot +59 | Overwegend positief |
| NEUTRAAL | -19 tot +19 | Geen duidelijke richting |
| VERKOPEN | -20 tot -59 | Overwegend negatief |
| STERK VERKOPEN | -60 tot -100 | Meerdere indicatoren bearish |

**Gebruikte indicatoren:**
- **RSI** (Relative Strength Index) — meet of een aandeel over- of ondergewaardeerd is op basis van recente koersbewegingen. Onder 30 = mogelijk koopmoment, boven 70 = mogelijk verkoopmoment.
- **MACD** (Moving Average Convergence Divergence) — meet trendmomentum. Positief histogram = opwaartse trend.
- **SMA 20/50/200** (Simple Moving Average) — gemiddelde koers over 20, 50 of 200 dagen. Prijs boven SMA = bullish.
- **Bollinger Bands** — koerskanaal. Prijs onder onderste band = mogelijk ondergewaardeerd.
- **Stochastic Oscillator** — vergelijkt slotkoers met het koersbereik. Onder 20 met opwaartse kruising = koopsignaal.

### Aandeel detailpagina (`/stocks/[SYMBOOL]`)
Klik op een aandeel voor de gedetailleerde weergave:
- **Koersgrafiek** — selecteerbaar per periode (1 maand tot 2 jaar)
- **Statistieken** — 52-weeks hoog/laag, volume, marktkapitalisatie, P/E-ratio
- **Technische indicatoren** — alle waarden van bovenstaande indicatoren
- **Claude AI Analyse** — klik de knop voor een volledige analyse in het Nederlands:
  - Samenvatting van het aandeel
  - Sentiment (BULLISH / BEARISH / NEUTRAAL)
  - Kernpunten, kansen en risico's
  - Concrete aanbeveling
  - Vertrouwensscore

> De AI-analyse kost een klein bedrag via de Anthropic API (typisch < €0,01 per analyse).

### Watchlist (`/watchlist`)
Houd aandelen in de gaten zonder ze te kopen:
- Voeg aandelen toe via de zoekfunctie
- Zie live koersen in EUR met dagwijziging
- Klik door naar de detailpagina voor analyse

### Alerts (`/alerts`)
Stel prijswaarschuwingen in:
- Kies een aandeel, conditie (boven of onder) en doelprijs
- De app controleert elke 2 minuten of de prijs bereikt is
- Getriggerde alerts worden groen gemarkeerd
- Je kunt alerts pauzeren, resetten of verwijderen

---

## Technische opbouw

```
src/
├── app/                    # Pagina's (Next.js App Router)
│   ├── page.tsx            # Dashboard
│   ├── portfolio/          # Portfolio beheer
│   ├── signals/            # AI signalen overzicht
│   ├── stocks/[symbol]/    # Aandeel detailpagina
│   ├── watchlist/          # Watchlist
│   ├── alerts/             # Prijs alerts
│   └── api/                # Backend API-routes
│       ├── portfolio/      # Portfolio CRUD
│       ├── holdings/[id]/  # Positie bewerken/verwijderen
│       ├── stocks/         # Yahoo Finance data ophalen
│       ├── alerts/         # Alerts beheren
│       ├── watchlist/      # Watchlist beheren
│       └── ai/analyze/     # Claude AI analyse
├── components/             # Herbruikbare UI-componenten
│   ├── Sidebar.tsx         # Navigatie
│   ├── charts/             # Recharts grafieken
│   └── ui/                 # Knoppen, badges, kaarten
└── lib/                    # Gedeelde logica
    ├── db.ts               # Prisma database client
    ├── yahoo-finance.ts    # Marktdata ophalen
    ├── technical-analysis.ts  # RSI, MACD, etc. berekenen
    └── claude-ai.ts        # Claude API aanroepen
```

### Gebruikte technologieën

| Technologie | Waarvoor |
|---|---|
| [Next.js 14](https://nextjs.org) | Full-stack React framework |
| [TypeScript](https://typescriptlang.org) | Getypeerde JavaScript |
| [Prisma](https://prisma.io) | Database ORM |
| [SQLite](https://sqlite.org) | Lokale database (geen server nodig) |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Recharts](https://recharts.org) | Interactieve grafieken |
| [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) | Gratis marktdata |
| [@anthropic-ai/sdk](https://docs.anthropic.com) | Claude AI |
| [lucide-react](https://lucide.dev) | Iconen |

---

## Veelgestelde vragen

**De AI-analyse knop werkt niet.**
Controleer of `ANTHROPIC_API_KEY` correct is ingesteld in `.env.local` en of de key geldig is via [console.anthropic.com](https://console.anthropic.com).

**Koersen laden niet.**
Yahoo Finance heeft soms beperkingen bij veel aanvragen achter elkaar. Wacht even en vernieuw de pagina. De app werkt met de gratis en onofficiële Yahoo Finance API.

**Kan ik de app online hosten?**
Ja — de app is een standaard Next.js app en kan gehost worden op [Vercel](https://vercel.com) (gratis tier beschikbaar). Vervang dan de SQLite database door een externe database zoals [Supabase](https://supabase.com) of [PlanetScale](https://planetscale.com).

**Zijn mijn gegevens veilig?**
Alle portfoliodata staat lokaal op je computer in `prisma/dev.db`. Er wordt niets gedeeld met externe servers, behalve de aandeel-symbolen die worden opgezocht bij Yahoo Finance en (bij AI-analyse) bij Anthropic.

---

## Disclaimer

Deze app is een persoonlijk hulpmiddel en **geen financieel advies**. De technische signalen en AI-analyses zijn gebaseerd op historische data en algoritmes. Handel altijd op basis van eigen onderzoek en raadpleeg een financieel adviseur bij twijfel.
