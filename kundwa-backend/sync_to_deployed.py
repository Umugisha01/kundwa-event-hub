import json
import urllib.request
import urllib.error

BASE_URL = "https://kundwa-event-hub.vercel.app"

def get_admin_token():
    login_url = f"{BASE_URL}/api/auth/login/"
    data = json.dumps({"username": "admin", "password": "Admin@Kundwa2026!"}).encode("utf-8")
    req = urllib.request.Request(login_url, data=data, headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
    res = urllib.request.urlopen(req, timeout=15)
    return json.loads(res.read().decode("utf-8"))["access"]

def sync():
    token = get_admin_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    }

    def api_req(endpoint, method="GET", data=None):
        url = f"{BASE_URL}{endpoint}"
        payload = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=payload, headers=headers, method=method)
        try:
            res = urllib.request.urlopen(req, timeout=15)
            if res.status == 204:
                return None
            return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            print(f"  [ERROR] {method} {url}: {e.code} - {err[:200]}")
            return None

    # Load local exported records
    with open("local_data_export.json", "r", encoding="utf-8") as f:
        export_data = json.load(f)

    from collections import defaultdict
    by_model = defaultdict(list)
    for row in export_data:
        by_model[row["model"]].append((row["pk"], row["fields"]))

    print("=== 1. SYNCING TESTIMONIALS ===")
    existing_t = api_req("/api/testimonials/") or []
    for t in existing_t:
        api_req(f"/api/testimonials/{t['id']}/", method="DELETE")
    for pk, fields in by_model["api.testimonial"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        res = api_req("/api/testimonials/", method="POST", data=data)
        print("  Testimonial inserted:", fields["client_name"])

    print("\n=== 2. SYNCING TRUSTED BRANDS ===")
    existing_b = api_req("/api/trusted_brands/") or []
    for b in existing_b:
        api_req(f"/api/trusted_brands/{b['id']}/", method="DELETE")
    for pk, fields in by_model["api.trustedbrand"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        res = api_req("/api/trusted_brands/", method="POST", data=data)
        print("  Brand inserted:", fields["name"], "logo:", fields["logo_url"])

    print("\n=== 3. SYNCING PORTFOLIO ===")
    existing_p = api_req("/api/portfolio/") or []
    for p in existing_p:
        api_req(f"/api/portfolio/{p['id']}/", method="DELETE")
    for pk, fields in by_model["api.portfolio"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        data.pop("updated_at", None)
        res = api_req("/api/portfolio/", method="POST", data=data)
        print("  Portfolio inserted:", fields["title"], "client:", fields.get("client"))

    print("\n=== 4. SYNCING EQUIPMENT CATEGORIES ===")
    existing_cats = api_req("/api/equipment_categories/") or []
    cat_map = {c["name"]: c["id"] for c in existing_cats}
    for pk, fields in by_model["api.equipmentcategory"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        if fields["name"] in cat_map:
            api_req(f"/api/equipment_categories/{cat_map[fields['name']]}/", method="PATCH", data=data)
            print("  Category updated:", fields["name"])
        else:
            res = api_req("/api/equipment_categories/", method="POST", data=data)
            print("  Category created:", fields["name"])

    print("\n=== 5. SYNCING EQUIPMENT ===")
    existing_eq = api_req("/api/equipment/") or []
    for eq in existing_eq:
        api_req(f"/api/equipment/{eq['id']}/", method="DELETE")
    for pk, fields in by_model["api.equipment"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        res = api_req("/api/equipment/", method="POST", data=data)
        print("  Equipment inserted:", fields["name"], "image:", fields["image_url"])

    print("\n=== 6. SYNCING MAIN SERVICES ===")
    existing_ms = api_req("/api/main_services/") or []
    ms_map = {m["title"]: m["id"] for m in existing_ms}
    for pk, fields in by_model["api.mainservice"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        data.pop("updated_at", None)
        if fields["title"] in ms_map:
            api_req(f"/api/main_services/{ms_map[fields['title']]}/", method="PATCH", data=data)
            print("  MainService updated:", fields["title"])
        else:
            api_req("/api/main_services/", method="POST", data=data)
            print("  MainService created:", fields["title"])

    print("\n=== 7. SYNCING SERVICES ===")
    existing_s = api_req("/api/services/") or []
    for s in existing_s:
        api_req(f"/api/services/{s['id']}/", method="DELETE")
    for pk, fields in by_model["api.service"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        res = api_req("/api/services/", method="POST", data=data)
        print("  Service inserted:", fields["name"], "category:", fields["category"])

    print("\n=== 8. SYNCING EVENTS ===")
    existing_ev = api_req("/api/events/") or []
    for ev in existing_ev:
        api_req(f"/api/events/{ev['id']}/", method="DELETE")
    for pk, fields in by_model["api.event"]:
        data = {**fields, "id": pk}
        data.pop("created_at", None)
        data.pop("updated_at", None)
        res = api_req("/api/events/", method="POST", data=data)
        print("  Event inserted:", fields["title"], "price:", fields["ticket_price"])

    print("\n=== 9. SYNCING SITE STATISTICS ===")
    existing_stats = api_req("/api/site_statistics/") or []
    for pk, fields in by_model["api.sitestatistic"]:
        data = {**fields, "id": pk}
        data.pop("updated_at", None)
        if existing_stats:
            api_req(f"/api/site_statistics/{existing_stats[0]['id']}/", method="PATCH", data=data)
            print("  SiteStatistic updated")
        else:
            api_req("/api/site_statistics/", method="POST", data=data)
            print("  SiteStatistic created")

    print("\n=== 10. SYNCING HERO SETTINGS ===")
    existing_hero = api_req("/api/hero_settings/") or []
    for pk, fields in by_model["api.herosettings"]:
        data = {**fields, "id": pk}
        data.pop("updated_at", None)
        if existing_hero:
            api_req(f"/api/hero_settings/{existing_hero[0]['id']}/", method="PATCH", data=data)
            print("  HeroSettings updated")
        else:
            api_req("/api/hero_settings/", method="POST", data=data)
            print("  HeroSettings created")

    print("\n=== 11. SYNCING FOOTER SETTINGS ===")
    existing_footer = api_req("/api/footer_settings/") or []
    for pk, fields in by_model["api.footersettings"]:
        data = {**fields, "id": pk}
        data.pop("updated_at", None)
        if existing_footer:
            api_req(f"/api/footer_settings/{existing_footer[0]['id']}/", method="PATCH", data=data)
            print("  FooterSettings updated")
        else:
            api_req("/api/footer_settings/", method="POST", data=data)
            print("  FooterSettings created")

    print("\n=== ALL SYNCHRONIZATION COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    sync()
