# Deployment Gids — Trading Tracker Pro

Stap-voor-stap gids om de backend op Vercel te zetten en de iOS app in de App Store te krijgen.

---

## Architectuur overzicht

```
iPhone App (Expo/React Native)
        ↓  HTTPS API calls
Vercel (Next.js backend) ← jouw-domein.nl
        ↓
Vercel Postgres (database)
        ↓
Yahoo Finance API (gratis)
Anthropic Claude API (betaald per gebruik)
```

---

## Deel 1: Backend deployen op Vercel

### Stap 1.1 — Vercel account & project aanmaken

1. Ga naar [vercel.com](https://vercel.com) en log in (of maak een account)
2. Klik **"Add New → Project"**
3. Selecteer jouw GitHub repository (`crookedangle`)
4. Vercel detecteert automatisch Next.js → klik **Deploy**

De eerste deploy zal falen omdat de database nog niet bestaat. Dat is normaal.

### Stap 1.2 — Vercel Postgres database aanmaken

1. Ga in Vercel Dashboard naar **Storage → Create Database → Postgres**
2. Geef het een naam (bv. `trading-db`)
3. Kies regio: **Frankfurt (fra1)** voor beste prestaties vanuit Europa
4. Na aanmaken: klik **".env.local" tab** en kopieer de twee variabelen:
   ```
   DATABASE_URL="postgresql://..."
   DATABASE_URL_UNPOOLED="postgresql://..."
   ```
5. Ga naar **Project Settings → Environment Variables** en voeg toe:
   - `DATABASE_URL` → de waarde van hierboven
   - `DATABASE_URL_UNPOOLED` → de waarde van hierboven
   - `ANTHROPIC_API_KEY` → jouw Claude API sleutel

### Stap 1.3 — Database schema aanmaken

In je lokale terminal (in de projectmap):
```bash
# Vervang de URL met jouw Vercel Postgres URL
DATABASE_URL="postgresql://..." npx prisma db push
```

Of via Vercel CLI:
```bash
npm install -g vercel
vercel env pull .env.local   # haalt Vercel env vars op
npx prisma db push
```

### Stap 1.4 — Domein koppelen

1. Vercel Dashboard → Project → **Settings → Domains**
2. Voeg jouw domein toe (bv. `app.jouwdomein.nl`)
3. Voeg bij jouw DNS provider een CNAME toe:
   ```
   app.jouwdomein.nl  →  cname.vercel-dns.com
   ```
4. Wacht 5-60 minuten totdat SSL actief is

✅ **Backend is live!** Test via: `https://app.jouwdomein.nl/api/stocks/AAPL`

---

## Deel 2: iOS app bouwen met Expo EAS

### Stap 2.1 — Expo & EAS installeren

```bash
npm install -g expo-cli eas-cli

# Log in op expo.dev (gratis account)
eas login
```

### Stap 2.2 — Project initialiseren

```bash
cd mobile

# Installeer dependencies
npm install

# Initialiseer EAS project (vraagt om Apple credentials)
eas init
```

Na `eas init`:
- Kopieer het **Project ID** dat je krijgt
- Zet dit in `mobile/app.config.ts` bij `eas.projectId`

### Stap 2.3 — App configureren

Open `mobile/app.config.ts` en pas aan:

```typescript
ios: {
  bundleIdentifier: "nl.jouwdomein.tradingtracker",  // ← jouw bundle ID
  // moet overeenkomen met wat in App Store Connect staat
},
extra: {
  eas: {
    projectId: "xxxx-xxxx-xxxx",  // ← van eas init
  },
},
```

Open `mobile/eas.json` en pas de submit-sectie aan:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "jouw@apple-id.com",
      "ascAppId": "1234567890",       // App Store Connect App ID
      "appleTeamId": "XXXXXXXXXX"    // Apple Developer Team ID
    }
  }
}
```

**Apple Developer Team ID** vind je op: [developer.apple.com/account](https://developer.apple.com/account)
**App Store Connect App ID** vind je in App Store Connect → jouw app → General → Apple ID (getal)

### Stap 2.4 — API URL instellen

Maak het bestand `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://app.jouwdomein.nl
```

### Stap 2.5 — Icons en splash screen

Voeg toe aan `mobile/assets/`:
- `icon.png` — 1024×1024 px, PNG, geen transparantie
- `splash.png` — 1284×2778 px (iPhone 14 Pro Max formaat), donkere achtergrond
- `adaptive-icon.png` — 1024×1024 px (voor Android)

Gratis tool om icons te maken: [appicon.co](https://www.appicon.co)

### Stap 2.6 — Test build (simulator)

```bash
cd mobile

# Bouw voor iOS simulator (gratis, geen Apple account nodig)
eas build --platform ios --profile development
```

Dit bouwt in de cloud via EAS. Duurt ±10 minuten.
Na de build download je het `.app` bestand en sleep je het naar de iOS Simulator.

### Stap 2.7 — Production build voor App Store

```bash
# Bouw voor App Store
eas build --platform ios --profile production
```

EAS vraagt automatisch om:
- Je Apple Developer account inloggegevens
- Toestemming om certificates en provisioning profiles aan te maken

Dit duurt ±15 minuten. Na de build:

```bash
# Upload direct naar App Store Connect
eas submit --platform ios
```

### Stap 2.8 — App Store Connect invullen

1. Ga naar [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Open jouw app → **TestFlight** tab → wacht tot de build verwerkt is
3. Vul in de **App Store** tab in:
   - Screenshots (gebruik iPhone 14 Pro Max formaat: 1290×2796)
   - Beschrijving: gebruik de tekst uit `README.md`
   - Categorie: **Finance**
   - Leeftijdscategorie: 4+
   - Privacy Policy URL (verplicht — maak een simpele pagina op jouw domein)

4. Klik **Submit for Review** (duurt 1-3 werkdagen)

---

## Deel 3: Updates uitbrengen

### Backend update
Gewoon pushen naar GitHub. Vercel deploy automatisch.

### App update
```bash
cd mobile
# Verhoog versie in app.config.ts (version + buildNumber)
eas build --platform ios --profile production
eas submit --platform ios
```

### Over-the-air updates (zonder App Store review)
Voor kleine UI-wijzigingen die geen native code raken:
```bash
eas update --branch production --message "Bug fix dashboard"
```
Dit pusht een update die de app automatisch oppikt binnen 24 uur.

---

## Checklist samengevat

### Backend (Vercel)
- [ ] GitHub repo verbonden met Vercel
- [ ] Vercel Postgres database aangemaakt
- [ ] `DATABASE_URL` en `DATABASE_URL_UNPOOLED` env vars ingesteld
- [ ] `ANTHROPIC_API_KEY` env var ingesteld
- [ ] `prisma db push` uitgevoerd op productie-database
- [ ] Domein gekoppeld en SSL actief
- [ ] API test: `https://jouwdomein.nl/api/stocks/AAPL` geeft data terug

### iOS App (EAS)
- [ ] Expo account aangemaakt
- [ ] `eas init` uitgevoerd, Project ID in `app.config.ts` gezet
- [ ] `bundleIdentifier` ingesteld (moet uniek zijn)
- [ ] Apple Developer account actief (€99/jaar)
- [ ] App aangemaakt in App Store Connect
- [ ] `ascAppId` en `appleTeamId` ingesteld in `eas.json`
- [ ] `icon.png` en `splash.png` toegevoegd
- [ ] `EXPO_PUBLIC_API_URL` ingesteld in `mobile/.env`
- [ ] Production build gemaakt: `eas build --platform ios --profile production`
- [ ] Geüpload: `eas submit --platform ios`
- [ ] App Store Connect info ingevuld
- [ ] Ingediend voor review

---

## Kosten overzicht

| Dienst | Kosten |
|---|---|
| Vercel (backend hosting) | Gratis (Hobby plan) |
| Vercel Postgres | Gratis (256 MB opslag) |
| Expo EAS Build | Gratis (30 builds/maand) |
| Apple Developer Program | €99/jaar |
| Yahoo Finance data | Gratis |
| Anthropic Claude API | ±€0,01 per AI-analyse |

---

## Veelvoorkomende problemen

**`prisma db push` geeft connection error**
→ Controleer of `DATABASE_URL_UNPOOLED` (niet de pooled URL) gebruikt wordt voor `db push`.

**EAS build faalt met "No Apple account"**
→ Zorg dat je ingelogd bent via `eas login` én dat je Apple Developer account actief is (betaald).

**App krijgt "Network error" op iPhone**
→ Controleer of `EXPO_PUBLIC_API_URL` correct is ingesteld en of de Vercel deployment actief is.

**App wordt afgewezen door Apple**
→ Meest voorkomende reden: ontbrekende Privacy Policy URL. Maak een simpele pagina op jouw domein.
