"""Browser regression checks for the studio copy and motion revision."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = os.environ.get('PIKAXU_PREVIEW_URL', 'http://127.0.0.1:4340').rstrip('/')
OUT = Path(os.environ.get('PIKAXU_EVIDENCE_DIR', '/private/tmp/pikaxu-copy-motion'))
OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    context = browser.new_context(viewport={'width':1440, 'height':1000})
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    routes = ['/', '/sisa/', '/bagibill/', '/kertas-kecil/', '/en/', '/en/sisa/', '/en/bagibill/', '/en/kertas-kecil/']
    for route in routes:
        assert page.goto(BASE + route).status == 200
        page.wait_for_timeout(1800)
        assert page.locator('.preview-label').count() == 0
        assert page.locator('h1').evaluate('(el) => getComputedStyle(el).fontFamily') == page.locator('h1 em').evaluate('(el) => getComputedStyle(el).fontFamily') if page.locator('h1 em').count() else True
        for width in [320,360,390,768,1024,1280,1440]:
            page.set_viewport_size({'width':width, 'height':900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width, 'overflow')
        if route in ['/', '/sisa/', '/kertas-kecil/']:
            page.screenshot(path=str(OUT / (route.strip('/').replace('/','-') or 'home')) + '-desktop.png', full_page=True)
            page.set_viewport_size({'width':390,'height':844})
            page.screenshot(path=str(OUT / (route.strip('/').replace('/','-') or 'home')) + '-mobile.png', full_page=True)
        if route in ['/', '/sisa/', '/en/', '/en/sisa/']:
            for first,second,intermediate in [('[data-spend]','[data-coffee-spend]','Rp85.000'),('[data-coffee-spend]','[data-spend]','Rp102.000')]:
                page.locator(first).focus(); page.keyboard.press('Enter')
                assert page.locator('[data-amount]').inner_text() == intermediate
                page.keyboard.press('Enter')
                assert page.locator('[data-amount]').inner_text() == intermediate
                page.locator(second).click()
                assert page.locator('[data-amount]').inner_text() == 'Rp67.000'
                assert 'Rp67.000' in page.locator('[data-status]').inner_text()
                page.locator('[data-reset]').click()
                assert page.locator('[data-amount]').inner_text() == 'Rp120.000'
    page.set_viewport_size({'width':390,'height':844})
    page.goto(BASE + '/')
    body = page.locator('body').inner_text()
    for removed in ['BELUM LAYAK RILIS', 'Aplikasi, buku & karya personal', 'Dibuat untuk keseharian.', 'Aplikasi untuk mengatur uang, buku aktivitas anak, dan karya yang dibuat khusus untuk Anda.']:
        assert removed not in body
    assert page.locator('.team-list').is_hidden()
    page.locator('.team-reveal summary').focus(); page.keyboard.press('Enter')
    assert page.locator('.team-list').is_visible()
    assert page.locator('.team-list li').count() == 3
    page.emulate_media(reduced_motion='reduce')
    page.evaluate('window.scrollTo(0,0)')
    page.wait_for_timeout(100)
    page.screenshot(path=str(OUT / 'team-mobile.png'), full_page=True)
    page.keyboard.press('Enter'); assert page.locator('.team-list').is_hidden()
    assert page.locator('.brand>span').first.evaluate('(e)=>getComputedStyle(e).color') == page.locator('.studio-wordmark>span').evaluate('(e)=>getComputedStyle(e).color')
    page.locator('#choice-bagibill').click()
    page.keyboard.press('ArrowRight'); assert page.locator('#kertas-note').is_visible()
    page.locator('#choice-sisa').click()
    assert page.locator('[data-amount]').inner_text() == 'Rp120.000'
    page.goto(BASE + '/kertas-kecil/#custom'); assert page.locator('#custom').evaluate('(e)=>e.open')
    page.evaluate('window.scrollTo(0,0)')
    page.wait_for_timeout(100)
    page.screenshot(path=str(OUT / 'custom-mobile.png'), full_page=True)
    assert page.locator('#custom h2 em .motion-letter').first.evaluate('(e)=>getComputedStyle(e).webkitTextFillColor') != 'rgba(0, 0, 0, 0)'
    # Strong finite movement, cancellation, and runtime reduced-motion changes.
    page.emulate_media(reduced_motion='no-preference')
    page.set_viewport_size({'width':1440,'height':1000}); page.goto(BASE + '/')
    page.wait_for_function('document.getAnimations().some(a=>a.playState === "running")')
    assert page.evaluate('document.getAnimations().some(a=>a.effect.getKeyframes()[0].transform?.includes("42px"))')
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function('document.getAnimations().filter(a=>a.playState === "running").length === 0')
    assert page.evaluate('document.getAnimations().filter(a=>a.playState === "running").length') == 0
    page.reload(); page.wait_for_timeout(250)
    assert page.evaluate('document.getAnimations().length') == 0
    page.emulate_media(reduced_motion='no-preference'); page.reload(); page.wait_for_timeout(1900)
    assert page.evaluate('document.getAnimations().filter(a=>a.playState === "running").length') == 0
    nojs = browser.new_context(java_script_enabled=False,viewport={'width':320,'height':700})
    plain = nojs.new_page()
    for route in ['/', '/sisa/', '/kertas-kecil/']:
        plain.goto(BASE + route)
        assert plain.locator('h1').is_visible()
        assert plain.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if route == '/':
            assert plain.locator('.team-list').is_hidden()
            plain.locator('.team-reveal summary').click(); assert plain.locator('.team-list').is_visible()
            assert plain.locator('[data-controls]').is_hidden()
            assert plain.locator('#bagibill-note').is_visible()
    assert errors == [], errors
    print(json.dumps({'browser':browser.version,'routes':routes,'widths':[320,360,390,768,1024,1280,1440],'result':'passed','errors':errors,'screenshots':str(OUT)},indent=2))
    browser.close()
