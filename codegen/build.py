#!/usr/bin/env python3
"""Build the luxury Code Forge pages from source/original.html (styling only).
   dist/ChaosKingdoms-CodeForge.html  - web version
   build/index.html                   - APK asset (+ Android host shim for file save / clipboard)"""
import base64, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'tools', 'fonts')
src = open(os.path.join(HERE, 'source', 'original.html'), encoding='utf8').read()
lux = open(os.path.join(HERE, 'source', 'luxury.css'), encoding='utf8').read()
b64 = lambda p: base64.b64encode(open(os.path.join(FONTS, p), 'rb').read()).decode()
faces = ''.join(f"@font-face{{font-family:'{f}';font-weight:{w};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,{b64(n)}) format('woff2')}}\n"
                for f, w, n in [('Cinzel', 700, 'cinzel-latin-700-normal.woff2'), ('Cinzel', 900, 'cinzel-latin-900-normal.woff2'),
                                ('Nunito', 700, 'nunito-latin-700-normal.woff2'), ('Nunito', 800, 'nunito-latin-800-normal.woff2'),
                                ('Nunito', 900, 'nunito-latin-900-normal.woff2')])
# remote Google Fonts -> embedded copies (works offline / in the APK)
s, n = re.subn(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*<link href="https://fonts.googleapis.com/css2[^"]*" rel="stylesheet">', '', src, count=1)
assert n == 1, 'font links not found'
s = s.replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#050506">', 1)
assert s.count('</head>') == 1
s = s.replace('</head>', f'<style id="ck-fonts">\n{faces}</style>\n<style id="ck-luxury">\n{lux}</style>\n</head>', 1)
os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
open(os.path.join(HERE, 'dist', 'ChaosKingdoms-CodeForge.html'), 'w', encoding='utf8').write(s)
# Android host shim: WebView cannot save blob: downloads and file:// pages may lack
# navigator.clipboard; route both to the native host. No change to the page's own logic.
shim = '''<script id="ck-android-host">
(function(){var H=window.CKHost;if(!H)return;
var oc=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){var a=this;if(a.download&&a.href&&a.href.indexOf('blob:')===0){fetch(a.href).then(function(r){return r.text()}).then(function(t){H.saveText(a.download,t)}).catch(function(){});return}return oc.apply(a,arguments)};
var cp={writeText:function(t){try{H.copy(String(t));return Promise.resolve()}catch(e){return Promise.reject(e)}}};
try{Object.defineProperty(navigator,'clipboard',{configurable:true,get:function(){return cp}})}catch(e){}
})();
</script>
'''
assert s.count('<script>') >= 1
s2 = s.replace('<script>', shim + '<script>', 1)
os.makedirs(os.path.join(HERE, 'build'), exist_ok=True)
open(os.path.join(HERE, 'build', 'index.html'), 'w', encoding='utf8').write(s2)
print('built', len(s), len(s2))
