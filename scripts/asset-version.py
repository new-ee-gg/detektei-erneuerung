#!/usr/bin/env python3
"""Cache-Busting für css/main.css und js/main.js.

Hängt an jede Referenz in allen HTML-Dateien einen Versionsparameter an, der aus dem
Inhalt der jeweiligen Datei gebildet wird (?v=<8 Zeichen SHA-256>). Ändert sich die Datei,
ändert sich die URL – Browser und CDN laden die neue Version, alte Kopien bleiben
unangetastet. Ohne Build-Schritt: vor jedem Deploy ausführen.

    python3 scripts/asset-version.py          # schreibt Änderungen
    python3 scripts/asset-version.py --check  # nur prüfen, Exit 1 wenn veraltet
"""
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ("css/main.css", "js/main.js")
PATTERN = re.compile(
    r'((?:href|src)=")((?:\.\./)*)(css/main\.css|js/main\.js)(?:\?v=[0-9a-f]+)?(")'
)


def content_hash(rel_path: str) -> str:
    digest = hashlib.sha256((ROOT / rel_path).read_bytes()).hexdigest()
    return digest[:8]


def rewrite(html: str, versions: dict[str, str]) -> str:
    def repl(match: re.Match[str]) -> str:
        prefix, up, asset, quote = match.groups()
        return f"{prefix}{up}{asset}?v={versions[asset]}{quote}"

    return PATTERN.sub(repl, html)


def main() -> int:
    check_only = "--check" in sys.argv
    versions = {asset: content_hash(asset) for asset in ASSETS}
    html_files = [p for p in ROOT.rglob("*.html") if "node_modules" not in p.parts]
    stale: list[Path] = []
    for path in html_files:
        original = path.read_text(encoding="utf-8")
        updated = rewrite(original, versions)
        if updated == original:
            continue
        stale.append(path)
        if not check_only:
            path.write_text(updated, encoding="utf-8")

    for asset, version in versions.items():
        print(f"{asset} -> ?v={version}")
    if check_only and stale:
        print(f"veraltet: {len(stale)} Datei(en)", file=sys.stderr)
        return 1
    print(f"{'zu aktualisieren' if check_only else 'aktualisiert'}: {len(stale)} von {len(html_files)} HTML-Dateien")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
