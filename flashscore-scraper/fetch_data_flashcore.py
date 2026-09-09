import requests
import re
import json
import os

from dotenv import load_dotenv
from supabase import create_client


# ============================================================
# 1. LOAD SUPABASE CONFIG
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Không tìm thấy NEXT_PUBLIC_SUPABASE_URL hoặc "
        "SUPABASE_SERVICE_ROLE_KEY trong file .env"
    )

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ============================================================
# 2. FLASHscore CONFIG
# ============================================================

FLASHCORE_MATCH_ID = "foBRjez1"

SUPABASE_MATCH_ID = 1635714

url = (
    f"https://global.flashscore.ninja/2/x/feed/"
    f"df_st_1_{FLASHCORE_MATCH_ID}"
)

headers = {
    "User-Agent": (
        "Mozilla/5.0 (Linux; Android 15; Pixel 8) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/152.0.0.0 Mobile Safari/537.36"
    ),
    "Accept": "*/*",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.6,en;q=0.5",
    "Origin": "https://www.flashscore.com",
    "Referer": "https://www.flashscore.com/",
    "X-Fsign": "SW9D1eZo",
}


# ============================================================
# 3. GET FLASHscore STATS
# ============================================================

def get_match_stats():

    response = requests.get(
        url,
        headers=headers
    )

    print("Flashscore status:", response.status_code)

    if response.status_code != 200:
        print("Không lấy được dữ liệu Flashscore.")
        return None

    raw = response.text

    print("Raw data length:", len(raw))

    # Chỉ lấy phần Match (toàn trận)
    match_section = raw.split(
        "~SE÷1st Half",
        1
    )[0]

    wanted_stats = {
        "Fouls": "fouls",
        "Goalkeeper saves": "saves",
        "Total shots": "shots",
        "Corner kicks": "corners",
        "Offsides": "offsides",
        "Ball possession": "possession",
        "Yellow cards": "yellowCards",
        "Shots on target": "shotsOnTarget",
    }

    home = {}
    away = {}

    pattern = (
        r"SG÷([^¬~]+)"
        r"¬SH÷([^¬~]+)"
        r"¬SI÷([^¬~]+)"
    )

    matches = re.findall(
        pattern,
        match_section
    )

    for stat_name, home_value, away_value in matches:

        if stat_name not in wanted_stats:
            continue

        key = wanted_stats[stat_name]

        # ----------------------------
        # Percentage
        # ----------------------------

        if "%" in home_value:
            home_value = home_value.split("%")[0]

        if "%" in away_value:
            away_value = away_value.split("%")[0]

        # ----------------------------
        # Convert number
        # ----------------------------

        try:
            home_value = int(home_value)
        except ValueError:
            try:
                home_value = float(home_value)
            except ValueError:
                pass

        try:
            away_value = int(away_value)
        except ValueError:
            try:
                away_value = float(away_value)
            except ValueError:
                pass

        home[key] = home_value
        away[key] = away_value

    return {
        "home": home,
        "away": away
    }


# ============================================================
# 4. UPDATE SUPABASE
# ============================================================

def update_supabase(stats):

    print()
    print("===== UPDATE SUPABASE =====")

    print("Supabase match_id:", SUPABASE_MATCH_ID)

    response = (
        supabase
        .table("matches")
        .update({
            "stats": stats
        })
        .eq("id", SUPABASE_MATCH_ID)
        .execute()
    )

    print("Update response:")
    print(response)


# ============================================================
# 5. MAIN
# ============================================================

if __name__ == "__main__":

    stats = get_match_stats()

    if not stats:
        print("Không có stats.")
        exit()

    print()
    print("===== PARSED STATS =====")

    print(
        json.dumps(
            stats,
            indent=2,
            ensure_ascii=False
        )
    )

    # Update đúng 1 trận
    update_supabase(stats)

    print()
    print("Hoàn thành!")