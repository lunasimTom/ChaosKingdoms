# Chaos Kingdoms app icon: full-bleed artwork from source/icon/source-icon.png (gold frame cropped) with a glossy 3D finish.
# usage: python3 tools/make_icon.py <outdir>  -> ic_bg.png/ic_fg.png (adaptive 432px), icon_full.png, icon_round.png
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
R='/home/user/ChaosKingdoms/'
src=Image.open(R+'source/icon/source-icon.png').convert('RGB')
art=src.crop((100,100,1154,1154))
art=ImageEnhance.Contrast(art).enhance(1.06)
art=ImageEnhance.Color(art).enhance(1.06)

def gloss(img):
    """3D glossy finish on a square image (full size)."""
    W=img.size[0]; img=img.convert('RGBA')
    big=W*2
    # edge vignette / bevel: darker rim
    v=Image.new('L',(big,big),0); d=ImageDraw.Draw(v)
    d.rounded_rectangle((big*.06,big*.06,big*.94,big*.94),radius=big*.22,fill=255)
    v=v.filter(ImageFilter.GaussianBlur(big*.06)).resize((W,W),Image.LANCZOS)
    dark=Image.new('RGBA',(W,W),(20,8,30,0)); dark.putalpha(ImageChops.invert(v).point(lambda a:int(a*.55)))
    img=Image.alpha_composite(img,dark)
    # top glossy arc: big ellipse, white gradient fading down
    g=Image.new('L',(W,W),0); gd=ImageDraw.Draw(g)
    for i in range(W//2):
        a=int(85*(1-i/(W/2))**1.6)
        gd.line((0,i,W,i),fill=a)
    m=Image.new('L',(big,big),0); ImageDraw.Draw(m).ellipse((-big*.35,-big*.62,big*1.35,big*.46),fill=255)
    m=m.filter(ImageFilter.GaussianBlur(big*.008)).resize((W,W),Image.LANCZOS)
    g=ImageChops.multiply(g,m)
    sheen=Image.new('RGBA',(W,W),(255,255,255,0)); sheen.putalpha(g)
    img=Image.alpha_composite(img,sheen)
    # diagonal specular streak (top-left)
    s=Image.new('L',(big,big),0); sd=ImageDraw.Draw(s)
    sd.polygon([(big*.10,big*.0),(big*.24,big*.0),(big*.0,big*.30),(big*.0,big*.16)],fill=120)
    s=s.filter(ImageFilter.GaussianBlur(big*.03)).resize((W,W),Image.LANCZOS)
    st=Image.new('RGBA',(W,W),(255,255,255,0)); st.putalpha(s); img=Image.alpha_composite(img,st)
    # thin light rim at top, inner shadow at bottom
    rim=Image.new('L',(big,big),0); rd=ImageDraw.Draw(rim)
    rd.rounded_rectangle((big*.012,big*.012,big*.988,big*.988),radius=big*.2,outline=255,width=int(big*.012))
    rim=rim.filter(ImageFilter.GaussianBlur(big*.006)).resize((W,W),Image.LANCZOS)
    grad=Image.linear_gradient('L').resize((W,W)).point(lambda p:int(150*(1-p/255)**2))
    rim=ImageChops.multiply(rim,grad)
    rl=Image.new('RGBA',(W,W),(255,250,230,0)); rl.putalpha(rim); img=Image.alpha_composite(img,rl)
    return img

def rounded(img,rad):
    W=img.size[0]; big=W*4
    m=Image.new('L',(big,big),0); ImageDraw.Draw(m).rounded_rectangle((0,0,big-1,big-1),radius=big*rad,fill=255)
    out=img.copy().convert('RGBA'); out.putalpha(m.resize((W,W),Image.LANCZOS)); return out

out=sys.argv[1]
# adaptive: 432 canvas, visible 288 centre. art at 312 in centre, outside: blurred stretched art
bg=art.resize((432,432),Image.LANCZOS).filter(ImageFilter.GaussianBlur(10))
bg=ImageEnhance.Brightness(bg).enhance(.8)
A=290; o=(432-A)//2
bg.paste(art.resize((A,A),Image.LANCZOS),(o,o))
# gloss applied relative to the visible 288 window
win=bg.crop((72,72,360,360)); g=gloss(win).convert('RGB'); bg.paste(g,(72,72))
bg.save(out+'/ic_bg.png')
Image.new('RGBA',(432,432),(0,0,0,0)).save(out+'/ic_fg.png')
full=gloss(art.resize((1024,1024),Image.LANCZOS))
full.convert('RGB').save(out+'/icon_full.png')                     # square full-bleed (maskable/web)
rounded(full,.2).save(out+'/icon_round.png')                         # legacy launcher / favicon
