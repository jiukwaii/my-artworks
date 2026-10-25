"""Resolve every generated local link and media path, including CSS font URLs."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,json,hashlib
ROOT=Path(__file__).resolve().parents[1]; SITE=ROOT/'src/site'
errors=[]; links=set(); html_count=0
class Inspect(HTMLParser):
    def __init__(self,path): super().__init__(); self.path=path; self.ids=[]; self.refs=[]; self.h1=0; self.meta={}; self.heading=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='h1': self.h1+=1
        for key in ('src','href','poster'):
            if a.get(key): self.refs.append(a[key])
        for key in ('srcset','imagesrcset'):
            if a.get(key): self.refs.extend(x.strip().split()[0] for x in a[key].split(','))
        if tag=='img' and 'alt' not in a: errors.append(str(self.path)+' missing alt')
        if tag=='meta': self.meta[a.get('name',a.get('property'))]=a.get('content')
def resolve(path,ref,ids=None):
    u=urlsplit(ref)
    if u.scheme in ('https','http','mailto','data'):
        if u.scheme.startswith('http'): links.add(ref)
        return
    dest=(SITE/u.path.lstrip('/') if u.path.startswith('/') else path.parent/unquote(u.path)) if u.path else path
    if dest.is_dir(): dest=dest/'index.html'
    if not dest.exists(): errors.append(f'{path.relative_to(SITE)} -> missing {ref}')
    elif u.fragment and path.suffix=='.html':
        target=Inspect(dest);target.feed(dest.read_text('utf8'))
        if u.fragment not in target.ids: errors.append(f'{path.relative_to(SITE)} -> missing anchor {ref}')
for file in SITE.rglob('*.html'):
    html_count+=1; p=Inspect(file);p.feed(file.read_text('utf8'))
    if len(p.ids)!=len(set(p.ids)): errors.append(str(file)+' duplicate ids')
    if '/games/' not in file.as_posix():
        if p.h1!=1: errors.append(str(file)+' must have one h1')
        for key in ('description','og:title','og:description','og:image','twitter:card'):
            if not p.meta.get(key): errors.append(str(file)+' missing '+key)
    for ref in p.refs: resolve(file,ref,p.ids)
for file in SITE.rglob('*.css'):
    for ref in re.findall(r'url\([\"\']?([^\"\')]+)',file.read_text('utf8')): resolve(file,ref)
baseline=json.loads((ROOT/'evidence/live-baseline-manifest.json').read_text('utf8'))
protected=[x for x in baseline if not x['path'].endswith(('.html','.css','.js','.txt','.xml'))]
preserved=all(hashlib.sha256((SITE/x['path']).read_bytes()).hexdigest()==x['sha256'] for x in protected)
if not preserved: errors.append('A baseline binary changed')
result={'html_files':html_count,'local_links_and_assets':'resolved' if not errors else 'failed','original_binary_files':len(protected),'binaries_unchanged':preserved,'external_links':sorted(links),'errors':errors}
(ROOT/'evidence/static-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
