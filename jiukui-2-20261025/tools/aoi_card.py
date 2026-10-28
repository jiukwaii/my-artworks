"""Fourth selected work, direct browser play; original cover and projects preserved."""
from html import escape as e
def arrow():
    return '<svg class="project-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>'
def game_card(game):
    return f'''<article class="project-card featured-lead aoi-game-card" aria-labelledby="aoi-game-title">
<div class="project-cover"><img src="assets/aoi/summer-delivery.png" width="1280" height="720" loading="lazy" decoding="async" alt="葵背著郵袋，站在許叔身旁，準備走向夏日小鎮的花房"></div>
<div class="project-copy"><div class="project-meta"><span class="aoi-meta-kind">3D 遊戲<span class="aoi-new">最新作品</span></span><time datetime="2026-10">2026.10</time></div>
<h3 id="aoi-game-title">葵・夏日送信</h3><p class="project-summary">送信少女葵的三天小鎮生活，一款 3D 休閒遊戲。</p>
<p class="project-context">從畫裡的角色，走進能自由探索的小鎮。替居民送信、聊聊天，也在下雨時一起把花盆搬進棚裡。</p>
<div class="project-actions"><a class="project-link aoi-desktop-action" href="{e(game['play_url'])}">直接體驗{arrow()}</a><button class="project-link aoi-mobile-action" type="button" data-aoi-copy="https://jiukui.vercel.app/play/aoi/">複製遊戲連結{arrow()}</button></div>
<p class="aoi-device-note aoi-desktop-action">電腦瀏覽器遊玩，需使用鍵盤與滑鼠。</p><p class="aoi-device-note aoi-mobile-action">請在電腦開啟遊戲，使用鍵盤與滑鼠遊玩。</p><p class="aoi-copy-status" role="status" aria-live="polite"></p>
</div></article>'''
