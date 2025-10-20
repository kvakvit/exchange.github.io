# Kursna lista (NBS) · GitHub Pages (SR)

Minimalan sajt (jedna stranica): NBS srednji kurs za EUR/USD/CHF + brz konverter. 
Bez baza podataka i bez backend-a — sve statički, a `rates.json` se osvežava preko GitHub Actions-a.

## Kako pokrenuti

1. Napravi **novi GitHub repo** i uključi **GitHub Pages** (Settings → Pages → Source: GitHub Actions).
2. Ubaci sve fajlove iz ovog repoa.
3. GitHub Actions `Update NBS rates` će se pokretati radnim danima na ~60 min (06–18 UTC ≈ 08–20 Beograd).
4. Prva verzija stranice se odmah može otvoriti: `/public/index.html` je glavni ulaz.

### Ručno osvežavanje
U tabu **Actions** klikni workflow `Update NBS rates` → **Run workflow** da bi `public/rates.json` bio svež.

## Struktura
- `public/index.html` — stranica (SR)
- `public/styles.css` — stilovi (tamna tema)
- `public/script.js` — učitavanje `rates.json`, tabela i konverter
- `public/rates.json` — podaci (generiše workflow)
- `.github/workflows/cron.yml` — raspored osvežavanja

## Izvor podataka
NBS (Narodna banka Srbije). Podaci se preuzimaju putem javnog JSON API-ja **kurs.resenje.org** koji koristi NBS veb-servis i objavljuje dnevne kursne liste (~08:00 Europe/Belgrade). 
Za produkciju po želji možeš direktno integrisati NBS SOAP veb-servise.
