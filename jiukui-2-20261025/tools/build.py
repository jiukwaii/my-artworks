"""Build the Traditional Chinese site from a preserved live template. Python stdlib only."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlsplit
from hashlib import sha256
import re, json

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'src/site'
BASE='https://jiukui.vercel.app/'
DATA=json.loads((ROOT/'content.json').read_text('utf8'))
LIVE=(ROOT/'templates/live.html').read_text('utf8')
ARROW='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
def link(url,label,external=False):
    return f'<a class="project-link" href="{escape(url)}"'+(' target="_blank" rel="noopener noreferrer"' if external else '')+f'>{escape(label)}{ARROW}</a>'
def section_title(id,title):
    rule=re.search(r'<div class="chapter-rule">(.*?)</div>',LIVE,re.S).group(1)
    return f'<div class="section-heading" data-enter="heading"><h2 id="{id}">{title}<span>。</span></h2><div class="chapter-rule">{rule}</div></div>'

TYPES=['遊戲','桌面 App 與 3D','網頁 App','桌面 App','日常工具','日常工具','實體模型','早期遊戲','早期遊戲']
ORIGINAL_CARDS=re.findall(r'<article class="project-card\b.*?</article>',LIVE,re.S)
def card(i):
    p=DATA['projects'][i]
    original=ORIGINAL_CARDS[i]
    cover=original.split('<div class="project-copy">')[0]
    cover=re.sub(r' aria-labelledby="project-\d+"','',cover)
    if i==0: cover=cover.replace('class="project-card"','class="project-card featured-lead"',1)
    date=re.search(r'<time\b.*?</time>',original,re.S)
    meta=f'<div class="project-meta"><span>{TYPES[i]}</span>{date.group(0) if date else ""}</div>'
    # Preserve newer live copy and public destinations rather than older local links.
    context=re.search(r'<p class="project-context">(.*?)</p>',original,re.S).group(1)
    actions=''
    if i!=1:
        old=re.search(r'<a class="project-link".*?</a>',original,re.S)
        if old: actions+=old.group(0)
    if i==6: actions+=re.search(r'<div class="model-photos">.*?</div>',original,re.S).group(0)
    action_group=f'<div class="project-actions">{actions}</div>' if actions else ''
    return cover+f'<div class="project-copy">{meta}<h3 id="project-{i}">{escape(p["name"])}</h3><p class="project-summary">{escape(p["summary"])}</p><p class="project-context">{context}</p>{action_group}</div></article>'

def head(path,title,description):
    graph={'@context':'https://schema.org','@graph':[
      {'@type':'Person','@id':BASE+'#person','name':'Jiukui / 玖葵','alternateName':['Leong Jia Wei','梁嘉偉'],'url':BASE,'sameAs':['https://www.instagram.com/jiukui_art/']},
      {'@type':'WebSite','@id':BASE+'#website','url':BASE,'name':'Jiukui / 玖葵','inLanguage':'zh-Hant','publisher':{'@id':BASE+'#person'}},
      {'@type':'WebPage','url':BASE+path,'name':title,'description':description,'inLanguage':'zh-Hant','isPartOf':{'@id':BASE+'#website'},'author':{'@id':BASE+'#person'}}]}
    meta=f'<title>{title}</title><meta name="description" content="{description}"><link rel="canonical" href="{BASE+path}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:site_name" content="Jiukui / 玖葵"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{BASE+path}"><meta property="og:locale" content="zh_TW"><meta property="og:image" content="{BASE}assets/og-kitchen-4x3-share-v2.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="900"><meta property="og:image:alt" content="玖葵的手繪插畫：女孩在廚房切麵包"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}"><meta name="twitter:image" content="{BASE}assets/og-kitchen-4x3-share-v2.jpg"><script type="application/ld+json">{json.dumps(graph,ensure_ascii=False)}</script>'
    old=LIVE[LIVE.index('<head>')+6:LIVE.index('</head>')]
    # Keep live favicon, responsive image preloads and font loading.
    keep=re.findall(r'<(?:link|meta)\b[^>]*>',old)
    keep=[s for s in keep if not any(x in s for x in ['canonical','alternate','name="description"','name="robots"','property="og:','name="twitter:'])]
    keep=[re.sub(r'\?v=[^" ]+','',s) for s in keep]
    scripts='' if 'projects/' in path else ''.join(re.sub(r'\?v=[^" ]+','',s) for s in re.findall(r'<script src=.*?</script>',old))
    return '<head>'+''.join(keep)+meta+'<link rel="stylesheet" href="assets/brand.css">'+scripts+'</head>'

class LocalPaths(HTMLParser):
    """Make local asset and navigation paths portable at any depth."""
    def __init__(self,prefix): super().__init__(convert_charrefs=False); self.prefix=prefix; self.out=[]; self.raw=0
    def start(self,tag,attrs,end='>'):
        result=[]
        for k,v in attrs:
            if v is None: result.append(k); continue
            if k in ('src','href','poster') and v and not v.startswith(('#','http','mailto:','data:')): v=self.prefix+v
            if k in ('srcset','imagesrcset'): v=', '.join(self.prefix+part.strip() for part in v.split(','))
            result.append(f'{k}="{escape(v,quote=True)}"')
        self.out.append('<'+tag+(' '+' '.join(result) if result else '')+end)
    def handle_starttag(self,tag,attrs): self.start(tag,attrs); self.raw+=tag in ('script','style')
    def handle_startendtag(self,tag,attrs): self.start(tag,attrs,'/>')
    def handle_endtag(self,tag): self.out.append('</'+tag+'>'); self.raw-=tag in ('script','style')
    def handle_data(self,data): self.out.append(data)
    def handle_entityref(self,n): self.out.append('&'+n+';')
    def handle_charref(self,n): self.out.append('&#'+n+';')
    def handle_decl(self,d): self.out.append('<!'+d+'>')
    def handle_comment(self,d): self.out.append('<!--'+d+'-->')

def emit(html,path):
    prefix='../'*len(Path(path).parts) if path else ''
    parser=LocalPaths(prefix); parser.feed(html)
    html=''.join(parser.out)
    # Content hashes prevent stale assets without requiring a bundler.
    for name in ['hero.css','site.css','book-effects.css','book-prototype.css','brand.css','site.js','book-interactions.js','book-prototype.js']:
        file=SITE/'assets'/name
        html=html.replace('assets/'+name+'"','assets/'+name+'?v='+sha256(file.read_bytes()).hexdigest()[:12]+'"')
    dest=SITE/path/'index.html'; dest.parent.mkdir(parents=True,exist_ok=True); dest.write_text(html,encoding='utf8')

def homepage():
    path=''
    body=LIVE[LIVE.index('<body'):]
    body=body.replace('插畫創作者 <span>·</span> AI Maker','插畫、角色與日常想法')
    body=re.sub(r'<p class="bio">.*?</p>','<p class="bio">從插畫出發，把想像做成能玩、能用，也能陪伴你的作品。</p>',body,count=1)
    body=body.replace('SINCE 2021','JIUKUI ART')
    work='<section class="works chapter" id="work" aria-labelledby="work-title">'+section_title('work-title','精選作品')+'<p class="section-intro">三件作品，看看角色、陪伴與日常想法如何成形。</p><div class="project-grid selected-grid">'+''.join(card(i) for i in (0,1,2))+'</div></section>'
    body=re.sub(r'<section class="works chapter".*?</section>',lambda _:work,body,count=1,flags=re.S)
    extra='<section class="experiments chapter" id="experiments" aria-labelledby="experiments-title">'+section_title('experiments-title','更多創作與嘗試')+'<h3 class="collection-title">日常小工具</h3><p class="section-intro">把反覆遇到的小困擾，做成可以試用的網頁。</p><div class="project-grid supporting-grid">'+''.join(card(i) for i in (5,4))+'</div><h3 class="collection-title">角色與實體探索</h3><div class="project-grid supporting-grid">'+''.join(card(i) for i in (3,6))+'</div><h3 class="collection-title">早期遊戲</h3><p class="section-intro">2025 年的兩次練習，保留開始、挑戰、失敗與再試一次。</p><div class="project-grid supporting-grid">'+''.join(card(i) for i in (7,8))+'</div></section>'
    body=body.replace('<section class="about chapter"',extra+'<section class="about chapter"',1)
    title='玖葵 Jiukui — 把想像做成作品'
    desc='來自馬來西亞的獨立創作者。從插畫出發，把角色與日常想法做成遊戲、桌寵、App 與實體作品。'
    emit('<!doctype html><html lang="zh-Hant">'+head(path,title,desc)+body,path)

if __name__=='__main__':
    homepage()
    paths=['','games/bird-jump/','games/cross-chicken/']
    sitemap='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+BASE+p+'</loc></url>' for p in paths)+'</urlset>'
    (SITE/'sitemap.xml').write_text(sitemap,encoding='utf8')
    (SITE/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+BASE+'sitemap.xml\n',encoding='utf8')
    print('Built Traditional Chinese homepage; 9 projects, 12 illustrations retained. No case-study or GitHub actions.')
