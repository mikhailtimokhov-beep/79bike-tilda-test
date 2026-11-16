#!/usr/bin/env python3
"""Парсер B2B-лидов для поиска дилеров/партнёров 79BIKE (Falcon).

Источники (только легальные):
  osm   — OpenStreetMap через Overpass API: бесплатно, без ключа.
  2gis  — официальный Catalog API 2GIS (нужен свой ключ: dev.2gis.com → TWOGIS_KEY).
Обогащение: сайт компании скачивается через curl_cffi (TLS-отпечаток Chrome),
если сайт отдаёт пустую JS-страницу — через Playwright (Chromium).
С сайта берутся e-mail, телефоны, Telegram/WhatsApp/VK, и считается скоринг.

Пример:
  python3 leads.py --cities "Казань,Самара" --out leads.csv
  TWOGIS_KEY=... python3 leads.py --source 2gis --query "мотосалон" --cities Казань
"""
import argparse, csv, os, re, sys, time, json
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlparse
from curl_cffi import requests

OVERPASS = ["https://overpass.kumi.systems/api/interpreter",
            "https://overpass-api.de/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
# Профильные для электромотоциклов точки продаж/сервиса
OSM_FILTER = ('nwr["shop"~"^(motorcycle|bicycle|motorcycle_repair|scooter|atv|outdoor|sports)$"](area.a);'
              'nwr["craft"="motorcycle_repair"](area.a);')
KEYWORDS = ["электро", "мото", "питбайк", "эндуро", "квадро", "скутер", "велосипед", "дилер", "сервис"]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}")
SOC = {"telegram": r"(?:t\.me|telegram\.me)/[\w+]{3,}", "whatsapp": r"(?:wa\.me|api\.whatsapp\.com/send\?phone=)[\d+]+",
       "vk": r"vk\.com/[\w.]{3,}"}
BAD_MAIL = (".png", ".jpg", ".webp", ".svg", "sentry", "example.", "wixpress", "domain.")


def norm_phone(p):
    d = re.sub(r"\D", "", p or "")
    if len(d) == 11 and d[0] in "78": return "+7" + d[1:]
    if len(d) == 10: return "+7" + d
    return ""


def norm_site(u):
    if not u: return ""
    u = u.strip().split(";")[0]
    return u if u.startswith("http") else "https://" + u


# ---------- источники ----------
def src_osm(city, _query):
    q = f'[out:json][timeout:90];area["name"="{city}"]["place"~"city|town"]->.a;' \
        f'(area["name"="{city}"]["boundary"="administrative"];)->.b;(.a;.b;)->.a;({OSM_FILTER});out center tags;'
    for url in OVERPASS:
        try:
            r = requests.post(url, data={"data": q}, impersonate="chrome", timeout=120)
            if r.status_code == 200:
                break
        except Exception as e:
            print(f"  overpass {url}: {e}", file=sys.stderr)
    else:
        return []
    out = []
    for e in r.json().get("elements", []):
        t = e.get("tags", {})
        if not t.get("name"): continue
        addr = ", ".join(x for x in (t.get("addr:street"), t.get("addr:housenumber")) if x)
        out.append(dict(source="osm", city=city, name=t["name"], category=t.get("shop") or t.get("craft", ""),
                        address=addr, phone=t.get("phone") or t.get("contact:phone", ""),
                        site=t.get("website") or t.get("contact:website", ""),
                        email=t.get("email") or t.get("contact:email", ""),
                        vk=t.get("contact:vk", ""), telegram=t.get("contact:telegram", ""), rating=""))
    return out


def src_2gis(city, query):
    key = os.environ.get("TWOGIS_KEY")
    if not key:
        sys.exit("Для --source 2gis задайте TWOGIS_KEY (ключ с dev.2gis.com)")
    out, page = [], 1
    while page <= 5:  # лимит демо-ключа: 5 страниц × 10
        r = requests.get("https://catalog.api.2gis.com/3.0/items", timeout=30, params={
            "q": f"{query} {city}", "type": "branch", "page": page, "page_size": 10, "key": key,
            "fields": "items.contact_groups,items.reviews,items.rubrics,items.address"})
        items = r.json().get("result", {}).get("items", [])
        if not items: break
        for it in items:
            c = {}
            for g in it.get("contact_groups", []):
                for ct in g.get("contacts", []):
                    c.setdefault(ct["type"], ct.get("value") or ct.get("url", ""))
            out.append(dict(source="2gis", city=city, name=it.get("name", ""),
                            category=", ".join(x["name"] for x in it.get("rubrics", [])[:2]),
                            address=it.get("address_name", ""), phone=c.get("phone", ""), site=c.get("website", ""),
                            email=c.get("email", ""), vk=c.get("vkontakte", ""), telegram=c.get("telegram", ""),
                            rating=it.get("reviews", {}).get("general_rating", "")))
        page += 1
    return out


# ---------- обогащение сайта ----------
_browser = None


def fetch_js(url):
    """Fallback для SPA-сайтов: рендер в Chromium."""
    global _browser
    from playwright.sync_api import sync_playwright
    if _browser is None:
        exe = os.environ.get("CHROME_PATH") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
        pw = sync_playwright().start()
        _browser = pw.chromium.launch(executable_path=exe, args=["--no-sandbox"]) if exe else pw.chromium.launch()
    pg = _browser.new_page()
    try:
        pg.goto(url, timeout=25000, wait_until="networkidle")
        return pg.content()
    finally:
        pg.close()


def fetch(url):
    try:
        r = requests.get(url, impersonate="chrome", timeout=20, allow_redirects=True)
        return r.text if r.status_code < 400 else ""
    except Exception:
        return ""


def scan(html, lead):
    for m in EMAIL_RE.findall(html):
        m = m.lower()
        if not m.endswith(BAD_MAIL) and not any(b in m for b in BAD_MAIL):
            lead["_emails"].add(m)
    for m in PHONE_RE.findall(html):
        if norm_phone(m): lead["_phones"].add(norm_phone(m))
    for k, rx in SOC.items():
        for m in re.findall(rx, html):
            lead["_soc"].setdefault(k, "https://" + m)


def enrich(lead, use_js=True):
    lead["_emails"], lead["_phones"], lead["_soc"] = set(), set(), {}
    site = norm_site(lead["site"])
    if site:
        html = fetch(site)
        if use_js and len(re.sub(r"<[^>]+>", "", html)) < 500:
            try: html = fetch_js(site)
            except Exception: pass
        scan(html, lead)
        # страница контактов
        for href in re.findall(r'href="([^"]*(?:contact|kontakt|контакт)[^"]*)"', html, re.I)[:1]:
            scan(fetch(urljoin(site, href)), lead)
        lead["site_text"] = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).lower()[:20000]
    else:
        lead["site_text"] = ""
    return lead


def finalize(lead):
    emails = {e.lower() for e in re.split(r"[;,\s]+", lead["email"]) if "@" in e} | lead.pop("_emails")
    phones = {norm_phone(p) for p in re.split(r"[;,]", lead["phone"]) if norm_phone(p)} | lead.pop("_phones")
    soc = lead.pop("_soc")
    lead["email"] = "; ".join(sorted(emails)[:3])
    lead["phone"] = "; ".join(sorted(phones)[:3])
    lead["telegram"] = lead["telegram"] or soc.get("telegram", "")
    lead["whatsapp"] = soc.get("whatsapp", "")
    lead["vk"] = lead["vk"] or soc.get("vk", "")
    text = (lead["name"] + " " + lead["category"] + " " + lead.pop("site_text")).lower()
    hits = [k for k in KEYWORDS if k in text]
    # Скоринг: есть ли с кем связаться + профиль
    score = 0
    score += 30 if lead["phone"] else 0
    score += 20 if lead["email"] else 0
    score += 10 if lead["telegram"] or lead["whatsapp"] else 0
    score += 10 if lead["site"] else 0
    score += 25 if "электро" in text else 0
    score += min(len(hits), 3) * 5
    lead["keywords"] = ", ".join(hits)
    lead["score"] = min(score, 100)
    return lead


FIELDS = ["score", "name", "city", "category", "address", "phone", "email", "telegram", "whatsapp", "vk",
          "site", "rating", "keywords", "source"]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cities", required=True, help="через запятую")
    ap.add_argument("--source", default="osm", choices=["osm", "2gis", "all"])
    ap.add_argument("--query", default="мототехника", help="запрос для 2gis")
    ap.add_argument("--out", default="leads.csv")
    ap.add_argument("--no-js", action="store_true", help="не запускать браузер для SPA-сайтов")
    ap.add_argument("--min-score", type=int, default=0)
    a = ap.parse_args()

    srcs = {"osm": [src_osm], "2gis": [src_2gis], "all": [src_osm, src_2gis]}[a.source]
    leads = []
    for city in [c.strip() for c in a.cities.split(",") if c.strip()]:
        for s in srcs:
            got = s(city, a.query)
            print(f"{city} / {s.__name__[4:]}: {len(got)}", file=sys.stderr)
            leads += got
            time.sleep(1)

    # дедуп по имени+городу
    uniq = {}
    for l in leads:
        uniq.setdefault((l["name"].lower().strip(), l["city"]), l)
    leads = list(uniq.values())

    # curl_cffi параллельно, Playwright — последовательно (один браузер)
    with ThreadPoolExecutor(8) as ex:
        leads = list(ex.map(lambda l: enrich(l, use_js=False), leads))
    if not a.no_js:
        for l in leads:
            if l["site"] and not l["_emails"] and not l["_phones"]:
                try: scan(fetch_js(norm_site(l["site"])), l)
                except Exception: pass

    leads = [finalize(l) for l in leads]
    leads = sorted((l for l in leads if l["score"] >= a.min_score), key=lambda l: -l["score"])
    with open(a.out, "w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig — чтобы Excel открыл кириллицу
        w = csv.DictWriter(f, FIELDS, extrasaction="ignore")
        w.writeheader(); w.writerows(leads)
    print(f"Готово: {len(leads)} лидов → {a.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
