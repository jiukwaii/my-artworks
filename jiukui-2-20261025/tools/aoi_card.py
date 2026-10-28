"""A fourth selected-work card; no standalone game page is published."""
from html import escape as e
from hashlib import sha256
import json

def arrow():
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'

def game_card(game):
    return f'''<article class="project-card featured-lead aoi-game-card" aria-labelledby="aoi-game-title">
<div class="project-cover"><img src="assets/aoi/summer-delivery.png" width="1280" height="720" loading="lazy" decoding="async" alt="葵背著郵袋，站在許叔身旁，準備走向夏日小鎮的花房"></div>
<div class="project-copy"><div class="project-meta"><span>3D 遊戲 · Windows</span><time datetime="2026-10">2026.10</time></div>
<h3 id="aoi-game-title">葵・夏日送信</h3><p class="project-summary">在夏日小鎮，替人們把心意送到。</p>
<p class="project-context">在夏日小鎮扮演送信少女葵，替居民送信、聊聊天，也一起度過一場雨。</p><p class="aoi-platform">Windows 64 位 · 2.2.0 · 約 479 MB</p>
<div class="project-actions"><a class="project-link" href="{e(game['download_url'])}">免費下載 Windows 版{arrow().replace('<svg ','<svg class="project-arrow" data-direction="external" ')}</a></div></div></article>'''
