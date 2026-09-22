from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re
class Page(HTMLParser):
 def __init__(self, path):
  super().__init__(); self.path=path; self.tags=[]; self.ids=[]; self.feed(path.read_text())
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
root=Path('dist');pages={p:Page(p) for p in root.rglob('*.html')};errors=[];warnings=[]
def check(value,message):
 if not value:errors.append(message)
def local(path):
 p=root/unquote(path).lstrip('/');return p/'index.html' if path.endswith('/') else p
for path,page in pages.items():

 if len(page.ids)!=len(set(page.ids)):
  (warnings if 'prototype' in path.parts else errors).append(f'{path}: duplicate IDs (unchanged archived prototype)' if 'prototype' in path.parts else f'{path}: duplicate IDs')
 check(sum(t=='h1' for t,a in page.tags)==1,f'{path}: expected one H1')
 check(any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in page.tags),f'{path}: preview must be noindex')
 for tag,a in page.tags:
  if tag=='a' and a.get('target')=='_blank': check(set(['noopener','noreferrer'])<=set(a.get('rel','').split()),f'{path}: unsafe tab')
  values=[]
  if tag in ['a','link']:values.append(a.get('href',''))
  if tag in ['script','img']:values.append(a.get('src',''))
  if tag=='meta' and a.get('property')=='og:image':values.append(urlsplit(a['content']).path)
  for value in values:
   if not value or urlsplit(value).scheme or value.startswith('//'):continue
   url=urlsplit(value)
   target=local(url.path) if url.path.startswith('/') else path if not url.path else path.parent/url.path
   check(target.exists(),f'{path}: missing {value}')
   if url.fragment and target in pages:check(unquote(url.fragment) in pages[target].ids,f'{path}: missing fragment {value}')
for path in [root/'index.html',root/'sisa/index.html']:
 page=pages[path]

 check(not any(t=='iframe' for t,a in page.tags),f'{path}: external iframe preloaded')
 check(any(t=='a' and a.get('href')=='https://sisa-demo.pika-xu.com' for t,a in page.tags),f'{path}: missing demo')
 check(any(t=='main' and a.get('id')=='main-content' for t,a in page.tags),f'{path}: skip target missing')
 check(not any(t=='script' and 'cloudflareinsights' in a.get('src','') for t,a in page.tags),f'{path}: analytics in local preview')
for base in ['/', '/sisa/', '/bagibill/', '/kertas-kecil/']:
 for language in ['id', 'en']:
  route=base if language=='id' else '/en'+base
  page=pages[local(route)]
  check(any(t=='html' and a.get('lang')==language for t,a in page.tags),f'{route}: wrong language')
  check(any(t=='link' and a.get('rel')=='canonical' and a.get('href')=='https://pika-xu.com'+route for t,a in page.tags),f'{route}: wrong canonical')
  for code,destination in [('id',base),('en','/en'+base),('x-default',base)]:
   check(any(t=='link' and a.get('hreflang')==code and a.get('href')=='https://pika-xu.com'+destination for t,a in page.tags),f'{route}: missing alternate {code}')
  check(not any('motion-toggle' in a.get('class','') for t,a in page.tags),f'{route}: obsolete motion control')
  text=page.path.read_text().lower()
  for removed in ['little rearranging','less to untangle','a little clarity','halfway built','ready to use','the repository contains','owner inventory','nothing here has to pretend']:
   check(removed not in text,f'{route}: obsolete customer copy: {removed}')
alias=pages[root/'products/sisa/index.html']
check(any(t=='link' and a.get('rel')=='canonical' and a.get('href')=='https://pika-xu.com/sisa/' for t,a in alias.tags),'alias canonical incorrect')
check(any(t=='a' and a.get('href')=='/sisa/' for t,a in alias.tags),'alias fallback missing')
check(not any(t=='link' and a.get('rel')=='canonical' for t,a in pages[root/'404.html'].tags),'404 canonical misleading')
check(any(t=='a' and a.get('href')=='/sisa/' for t,a in pages[root/'id/products/sisa/index.html'].tags),'ID counterpart incorrect')
check('<loc>' not in (root/'sitemap.xml').read_text(),'preview sitemap promotes pages')
check(any(t=='a' and a.get('href')=='https://pikaxustudio.gumroad.com/l/sisa-app' for t,a in pages[root/'sisa/index.html'].tags),'checkout incorrect')
for path in root.rglob('*.css'):
 for source in re.findall(r'url\([\"\']?([^\)\"\']+)',path.read_text()):
  if source.startswith('/'):check(local(source).exists(),f'{path}: missing CSS asset {source}')
result={'scope':'Static build, local links/fragments/assets/metadata; not external service or visual verification','pages':len(pages),'errors':errors,'historicalWarnings':warnings}
print(json.dumps(result,indent=2));assert not errors
