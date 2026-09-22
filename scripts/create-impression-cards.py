"""Raster typography for social metadata; no webpage capture or external artwork."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUTPUT = Path(__file__).resolve().parents[1] / 'public/art'
FONT = Path('/System/Library/Fonts/Supplemental/Arial.ttf')
BOLD = Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
ITALIC = Path('/System/Library/Fonts/Supplemental/Georgia Italic.ttf')
PAPER, INK, ACID = '#f2efdf', '#42222c', '#e4f078'
def font(size, style=FONT):
    return ImageFont.truetype(str(style),size)
def card(name, lines, footer):
    im=Image.new('RGB',(1200,630),PAPER)
    d=ImageDraw.Draw(im)
    d.text((60,36),'pika—xu',font=font(38,BOLD),fill=INK)
    d.line((60,100,1140,100),fill=INK,width=2)
    d.text((60,132),lines[0],font=font(93,BOLD),fill=INK)
    d.rectangle((60,260,1140,470),fill=ACID)
    d.text((95,285),lines[1],font=font(86,BOLD),fill=INK)
    d.line((60,525,1140,525),fill=INK,width=2)
    d.text((60,557),footer,font=font(24),fill=INK)
    im.save(OUTPUT/name,quality=90)
card('impression-studio.webp',('Bikin hari-hari','lebih mudah.'),'Sisa  /  BagiBill  /  Kertas Kecil Project')
card('impression-sisa.webp',('Sisa.','Kelola uang harian.'),'Aplikasi pengelola uang.')
card('impression-studio-en.webp',('Make everyday','life easier.'),'Sisa  /  BagiBill  /  Kertas Kecil Project')
card('impression-sisa-en.webp',('Sisa.','Manage your money.'),'Money manager app for everyday spending.')
im=Image.new('RGB',(192,192),ACID)
d=ImageDraw.Draw(im)
d.text((17,19),'px',font=font(116,BOLD),fill=INK)
d.line((23,157,169,157),fill=INK,width=5)
im.save(OUTPUT/'impression-icon.png')
