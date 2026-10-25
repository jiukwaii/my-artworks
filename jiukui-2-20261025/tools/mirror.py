"""Archive the publicly served static site, following only same-origin assets."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urljoin, urlsplit, unquote
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import re, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://jiukui.vercel.app/'
SITE = ROOT / 'src/site'
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for k in ('src','href','poster'):
            if attrs.get(k): self.links.append(attrs[k])
        if attrs.get('srcset'):
            self.links += [p.strip().split()[0] for p in attrs['srcset'].split(',')]
def fetch(path):
    with urlopen(Request(urljoin(BASE,path),headers={'User-Agent':'Jiukui-archive/2.0'}),timeout=40) as r: data=r.read()
    dest=SITE/path; dest.parent.mkdir(parents=True,exist_ok=True); dest.write_bytes(data)
    refs=[]
    if path.endswith(('.html','.css','.js')):
        s=data.decode('utf8')
        if path.endswith('.html'):
            p=Links(); p.feed(s); refs=p.links
        if path.endswith('.css'): refs+=re.findall(r'url\([\"\']?([^\"\')]+)',s)
    result=[]
    for ref in refs:
        u=urlsplit(urljoin(urljoin(BASE,path),ref))
        if u.netloc!='jiukui.vercel.app' or ref.startswith('#'): continue
        target=unquote(u.path.lstrip('/')) or 'index.html'
        if target.endswith('/'): target+='index.html'
        if '..' not in Path(target).parts: result.append(target)
    return {'path':path,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}, result

if __name__=='__main__':
    seen=set(); pending={'index.html','robots.txt','sitemap.xml','games/bird-jump/index.html','games/cross-chicken/index.html'}; manifest=[]
    with ThreadPoolExecutor(max_workers=8) as pool:
        while pending:
            batch=sorted(pending-seen); pending=set()
            if not batch: break
            seen.update(batch)
            for item,refs in pool.map(fetch,batch): manifest.append(item); pending.update(set(refs)-seen)
    out=ROOT/'evidence'; out.mkdir(exist_ok=True)
    (out/'live-baseline-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
    print(json.dumps({'files':len(manifest),'bytes':sum(x['bytes'] for x in manifest)}))
