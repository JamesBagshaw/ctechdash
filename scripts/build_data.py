#!/usr/bin/env python3
"""
Converts data/equipment.csv into data/equipment.json for the website.

Usage:
    python3 scripts/build_data.py

Run this every time you edit equipment.csv (e.g. after exporting an
updated spreadsheet from Excel/Numbers/Google Sheets as CSV), then
redeploy/reupload the site.
"""
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "equipment.csv"
JSON_PATH = ROOT / "data" / "equipment.json"

REQUIRED_COLUMNS = {"Name", "Category"}


def main():
    if not CSV_PATH.exists():
        sys.exit(f"Could not find {CSV_PATH}")

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            sys.exit(f"equipment.csv is missing required column(s): {', '.join(sorted(missing))}")

        items = []
        for i, row in enumerate(reader, start=2):  # row 1 is the header
            name = (row.get("Name") or "").strip()
            category = (row.get("Category") or "").strip()
            if not name or not category:
                print(f"Skipping row {i}: Name and Category are both required")
                continue

            tags = [t.strip() for t in (row.get("Tags") or "").split(";") if t.strip()]

            items.append({
                "id": i - 1,
                "name": name,
                "category": category,
                "description": (row.get("Description") or "").strip(),
                "quantity": (row.get("Quantity") or "").strip(),
                "location": (row.get("Location") or "").strip(),
                "tags": tags,
            })

    items.sort(key=lambda x: (x["category"].lower(), x["name"].lower()))
    categories = sorted({item["category"] for item in items}, key=str.lower)

    output = {"items": items, "categories": categories}
    JSON_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(items)} items across {len(categories)} categories to {JSON_PATH}")


if __name__ == "__main__":
    main()
