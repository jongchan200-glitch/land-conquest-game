from pathlib import Path
import base64,json,re
root=Path(__file__).parent
p=root/'work-larva-renderer.js'
art={f.stem:'data:image/png;base64,'+base64.b64encode(f.read_bytes()).decode() for f in sorted((root/'parts').glob('*.png'))}
s,n=re.subn(r'const ART_DATA=\{[^\n]+\};','const ART_DATA='+json.dumps(art)+';',p.read_text('utf8'),count=1)
assert n==1
p.write_text(s,'utf8')
