# scripts/fetch_rates.py
# NBS-only: pulls middle rates via Kurs API (https://kurs.resenje.org/doc/) which mirrors NBS web-service.
# Outputs compact JSON at public/rates.json for the static page.

import json, datetime, sys, pathlib
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

OUTPUT = pathlib.Path(__file__).parent.parent / "public" / "rates.json"
CODES = ["EUR","USD","CHF"]

def get_today_all():
    url = "https://kurs.resenje.org/api/v1/rates/today"
    with urlopen(url, timeout=10) as r:
        data = json.loads(r.read().decode("utf-8"))
    return data.get("rates", [])

def main():
    try:
        all_rates = get_today_all()
        wanted = []
        for code in CODES:
            row = next((x for x in all_rates if x.get("code")==code), None)
            if not row: continue
            # Use exchange_middle (srednji kurs NBS)
            mid = row.get("exchange_middle")
            if mid is None:
                # Fallback: try 'rate' (for announced) or compute from buy/sell if present
                rate = row.get("rate")
                if rate is not None:
                    mid = rate
                else:
                    cb, cs = row.get("exchange_buy"), row.get("exchange_sell")
                    if cb is not None and cs is not None:
                        mid = (cb + cs) / 2
            if mid is None: 
                continue
            wanted.append({"code": code, "mid": round(float(mid), 6)})
        out = {
            "g": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
            "rates": wanted
        }
        OUTPUT.write_text(json.dumps(out, separators=(',',':')), encoding="utf-8")
        print("written", OUTPUT)
    except (URLError, HTTPError) as e:
        print("fetch error:", e, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
