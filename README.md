# Stockard

Správce věrnostních karet pro **Android i iOS** (Expo / React Native). Inspirovaný starým Stocardem – ale bez cloudu, účtů a reklam.

## Co umí

- **Vše jen lokálně** – karty jsou v SQLite databázi v privátním úložišti aplikace. Žádný server, žádné odesílání, žádná analytika. (`allowBackup` je na Androidu vypnuté.)
- **Přidání ze seznamu nejčastějších značek** (`src/data/brands.ts`) – u každé je uvedeno, jestli obvykle používá **QR** nebo **klasický čárový kód**.
- **Tři způsoby zadání kódu**
  1. skenování **kamerou**,
  2. načtení z **uložené fotky / screenshotu** (nativní skener + JS fallback přes ZXing, takže na iOS fungují i čárové kódy, ne jen QR),
  3. **ruční zadání** čísla a výběr typu kódu.
- Podporované typy: QR, Aztec, Data Matrix, PDF417, Code 128, Code 39, Code 93, EAN-13, EAN-8, UPC-A, UPC-E, ITF, Codabar.
- Zobrazení karty na pokladně: kód na bílém podkladu, **jas na maximum**, displej nezhasíná, po odchodu se jas vrátí.
- Vyhledávání, řazení podle poslední použité, úprava a mazání, poznámka, barva karty, světlý/tmavý režim.

## Spuštění

```bash
npm install
npx expo start        # naskenujte QR kód aplikací Expo Go (iOS/Android)
```

> Skener kamery a načtení z fotek fungují v Expo Go. Pro vlastní instalovatelnou aplikaci:

```bash
npx expo run:android            # potřebuje Android SDK
npx expo run:ios                # potřebuje macOS + Xcode
# nebo v cloudu:
npx eas build -p android --profile preview   # .apk
npx eas build -p ios --profile production
```

Bundle ID / package je `app.stockard.cards` (změňte v `app.json`).

## Struktura

```
src/
  App.tsx                    navigace
  screens/                   Home, PickBrand, EditCard, CardDetail
  components/                CodeView (vykreslení kódu), ScannerModal, CardTile
  lib/codes.ts               typy kódů (expo-camera ↔ bwip-js ↔ popisky)
  lib/barcodeSvg.ts          vykreslení + validace (bwip-js, čistý JS)
  lib/imageScan.ts           načtení kódu z obrázku (native + ZXing fallback)
  lib/db.ts                  SQLite
  data/brands.ts             seznam značek a jejich typ kódu
```

## Poznámky

- Typ kódu u značek v `brands.ts` je **orientační** (řetězce karty časem mění). Skutečný typ se vždy zjistí ze skenu a jde změnit ručně – seznam si klidně upravte.
- Při načítání z fotky je nejlepší ostrý snímek, kde kód zabírá velkou část obrázku.
- Zatím není záloha/export – při změně telefonu je nutné karty přidat znovu (je to daň za „jen lokálně“).

## Release přes Git (Android APK)

```bash
git tag v1.0.0
git push origin v1.0.0
```

Alternativa bez příkazové řádky: *Actions → Release → Run workflow*, zadat verzi (např. `1.0.0`) – tag `v1.0.0` si GitHub vytvoří sám na zvoleném commitu.

GitHub Actions (`.github/workflows/release.yml`) sám postaví podepsaný APK a připojí ho k Release. Stáhneš ho v telefonu ze záložky *Releases* a nainstaluješ (povol instalaci z neznámých zdrojů). Žádný Expo účet není potřeba. `versionCode` se bere z čísla běhu, takže novější release jde nainstalovat přes starší.

APK je podepsaný výchozím klíčem Expo šablony – stačí k testování a sdílení mimo obchod. Pro Google Play si vygeneruj vlastní keystore.
iOS: bez placeného Apple Developer účtu se instalovatelný build vytvořit nedá.
