from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np, json,base64
from io import BytesIO
root=Path(__file__).parent
im=Image.open(root/'design.png').convert('RGBA')
head=im.crop((78,137,294,314))
def polygon(size,coords):
    m=Image.new('L',size);ImageDraw.Draw(m).polygon(coords,fill=255);return m.filter(ImageFilter.GaussianBlur(.65))
def masked(img,mask):
    o=img.copy();o.putalpha(mask);return o
outline=polygon(head.size,[(6,103),(9,86),(16,63),(26,46),(39,29),(59,16),(76,10),(86,7),(113,6),(138,10),(158,17),(176,29),(191,46),(204,68),(212,91),(211,112),(204,135),(189,153),(172,164),(145,172),(114,176),(91,174),(66,170),(41,160),(23,147),(13,131),(7,115)])
def oval(box):
    m=Image.new('L',head.size);ImageDraw.Draw(m).ellipse(box,fill=255);return m.filter(ImageFilter.GaussianBlur(.7))
items={}
eyes=[(20,55,51,108),(111,62,154,117)]
for i,box in enumerate(eyes):items['eye'+str(i)]=masked(head,oval(box)).crop(box)
ring_pts=[(38,119),(42,107),(51,98),(63,92),(76,90),(89,93),(104,102),(115,114),(121,131),(120,144),(113,155),(101,163),(87,166),(72,163),(55,155),(45,146),(39,133)]
outer=polygon(head.size,ring_pts)
inner=polygon(head.size,[(48,118),(52,109),(61,104),(72,101),(83,102),(94,108),(103,117),(109,129),(109,138),(105,147),(96,152),(86,153),(73,149),(61,141),(53,133)])
from PIL import ImageChops
items['ring']=masked(head,ImageChops.subtract(outer,inner)).crop((36,88,124,168))
# Harmonic fill removes baked moving features from the skin plate.
holes=np.array(outer)>0
for box in eyes:holes |= np.array(oval(box))>0
holes |= np.array(polygon(head.size,[(80,0),(110,0),(111,29),(101,35),(86,32),(81,27)]))>0
a=np.array(head)[:,:,:3].astype('float32')
a[holes]=[249,191,155]
for _ in range(650):
    pad=np.pad(a,((1,1),(1,1),(0,0)),mode='edge')
    avg=(pad[:-2,1:-1]+pad[2:,1:-1]+pad[1:-1,:-2]+pad[1:-1,2:])*.25
    a[holes]=avg[holes]
items['skin']=masked(Image.fromarray(a.astype('uint8')),outline)
ant=im.crop((156,69,227,172))
items['antenna']=masked(ant,polygon(ant.size,[(3,91),(4,74),(9,54),(18,42),(12,32),(12,23),(17,12),(28,5),(43,3),(55,9),(65,19),(67,33),(62,47),(52,55),(38,58),(30,56),(27,70),(29,84),(29,94),(23,100),(13,101),(6,98)]))
folder=root/'parts';folder.mkdir(exist_ok=True)
for key,img in items.items():img.save(folder/(key+'.png'))
