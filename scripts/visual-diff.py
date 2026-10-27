# Визуальное сравнение: исходник Claude (src/) против сборки (dist/site/) на 5 ширинах.
import subprocess, time, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"check-report","diff"); os.makedirs(OUT,exist_ok=True)
srv=[subprocess.Popen([sys.executable,"-m","http.server",str(pt),"-d",d],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) for pt,d in ((8801,os.path.join(ROOT,"src")),(8802,os.path.join(ROOT,"dist","site")))]
time.sleep(1.2)
FREEZE="document.querySelectorAll('video').forEach(v=>{v.pause();v.currentTime=0;v.removeAttribute('autoplay')});document.documentElement.style.scrollBehavior='auto';const s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';document.head.appendChild(s);"
rows=[]
with sync_playwright() as pw:
  b=pw.chromium.launch()
  for w,h in ((375,812),(390,844),(768,1024),(1440,900),(1920,1080)):
    shots=[]
    for pt in (8801,8802):
      pg=b.new_page(viewport={"width":w,"height":h},is_mobile=w<800,has_touch=w<800)
      pg.goto(f"http://127.0.0.1:{pt}/rep/index.html",wait_until="load"); pg.wait_for_timeout(1500)
      pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=innerHeight){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}scrollTo(0,0)}"); pg.wait_for_timeout(800)
      pg.evaluate(FREEZE); pg.wait_for_timeout(500)
      f=os.path.join(OUT,f"{'src' if pt==8801 else 'dist'}-{w}.png"); pg.screenshot(path=f,full_page=True); shots.append(f); pg.close()
    a,c=Image.open(shots[0]).convert("RGB"),Image.open(shots[1]).convert("RGB")
    if a.size!=c.size: rows.append((w,f"разная высота {a.size[1]} / {c.size[1]}",None)); continue
    d=ImageChops.difference(a,c).convert("L").point(lambda x:255 if x>24 else 0)
    px=sum(1 for v in d.getdata() if v); pct=100*px/(a.size[0]*a.size[1])
    bbox=d.getbbox(); rows.append((w,f"{pct:.3f}% пикселей отличается",bbox))
  b.close()
for s in srv: s.kill()
for w,t,bb in rows: print(f"{w}px: {t}" + (f", область {bb}" if bb else ""))
