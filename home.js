/* Home lobby V0.2.8. The existing game world, rules, saves and shop remain authoritative.
   Layout/menu order deliberately mirrors hell-drop V0.7. */
(function(){
 'use strict';
 const home=document.getElementById('landHome'),drawer=document.getElementById('homeDrawer'),content=document.getElementById('homeDrawerBody'),title=document.getElementById('homeDrawerTitle');
 if(!home)return;
 const recordsKey='land-conquest-home-records-v1',previewKey='land-conquest-home-badge-preview-v1';
 let best=0,selectedPanel='',albumIndex=0,albumView='roster',selectedCard=1;
 const previews=[
  {sheet:'./assets/cards/haena-8-preview.png',size:[1536,1024],rects:Array.from({length:8},(_,i)=>[(i%4)*384,i<4?0:385,384,383]),status:'구도·디자인 시안 / 얼굴 통일 미검수'},
  {sheet:'./assets/cards/anika-8-preview.png',size:[1199,1312],rects:Array.from({length:8},(_,i)=>[30+(i%4)*283,i<4?528:868,279,i<4?333:390]),status:'01번 대표 얼굴만 확정 / 나머지 시안'},
  {sheet:'./assets/cards/amara-8-preview.png',size:[1502,1058],rects:Array.from({length:8},(_,i)=>[23+(i%4)*357,i<4?23:521,342,426]),status:'8장 후보 사진 / 대표 얼굴 미확정'}
 ];
 const amara={id:'CHAR_003',name:'아마라',english:'AMARA',country:'우간다 · 가상 설정',age:16,
   topics:['아이를 바라보는 눈빛','책 읽어주는 오후','어르신께 나눔','요리 전 준비','공동 부엌의 요리사','옷가지 정리','따뜻한 한 그릇','옷깃을 고쳐주다']};
 const roster=Array.from({length:8},(_,i)=>{
   const ch=characters[i]||(i===2?amara:null)||{id:'CHAR_'+String(i+1).padStart(3,'0'),name:'미공개 인물 '+String(i+1).padStart(2,'0'),english:'COMING SOON',country:'새로운 이야기',topics:Array.from({length:8},(_,j)=>j===7?'스페셜 카드':'이야기 '+(j+1))};
   return previews[i]?{...ch,previewSheet:previews[i].sheet,previewSize:previews[i].size,previewRects:previews[i].rects,previewStatus:previews[i].status}:ch;
 });
 let showPreview=true; // Visual QA only; never mutate state.album or reveal reward rarity.
 const canPreview=ch=>showPreview&&!!ch?.previewSheet;
 function previewArt(ch,k){
  if(!canPreview(ch))return '';
  const [x,y,w,h]=ch.previewRects[k-1]||ch.previewRects[0], [W,H]=ch.previewSize;
  return '<span class="ww-card-crop" style="--ww-r:'+w+'/'+h+'" aria-label="'+ch.name+' '+k+'번 시안"><img loading="lazy" src="'+ch.previewSheet+'" alt="" style="left:'+(-x/w*100)+'%;top:'+(-y/h*100)+'%;width:'+(W/w*100)+'%;height:'+(H/h*100)+'%"></span>';
 }

 const ownedAt=(i,k)=>!!state.album[roster[i].id+'_'+String(k).padStart(2,'0')];
 const ownedCount=i=>Array.from({length:8},(_,k)=>ownedAt(i,k+1)).filter(Boolean).length;
 const totalOwned=()=>roster.reduce((a,_,i)=>a+ownedCount(i),0);
 const pctCards=i=>Math.round(ownedCount(i)/8*100);
 const dailyKey='land-conquest-daily-v1';
 const dayId=()=>new Date().toLocaleDateString('en-CA');
 const dailyUsed=()=>{try{return localStorage.getItem(dailyKey)===dayId()}catch(e){return true}};
 try{best=Number(JSON.parse(localStorage.getItem(recordsKey)||'{}').best)||0}catch(e){}
 function num(n){return Math.max(0,Number(n)||0).toLocaleString('ko-KR')}
 function refreshStats(){
  if(!state)return;
  let pct=Number(capture().toFixed(2));if(pct>best){best=pct;try{localStorage.setItem(recordsKey,JSON.stringify({best:Math.min(100,best)}))}catch(e){}}
  document.getElementById('homeLevel').textContent=state.level;
  document.getElementById('homeXp').style.width=Math.min(100,Math.round(state.xp/xpLimit(state.level)*100))+'%';
  document.getElementById('homeCoins').textContent=num(state.coins);
  document.getElementById('homeBest').textContent=best.toFixed(1);
  document.getElementById('homeCaught').textContent=num(state.captures||0);
  document.getElementById('homePlaySub').textContent=state.tiles||pct>15?'이어서 탐험':'탐험 시작';window.wwApplyLanguage?.();
 }
 function openHome(){
  if(!state)return;
  save(); // keep any established game progress before showing the lobby
  home.hidden=false;window.__homeIsOpen=true;modal='home';playStarted=false;
  held=false;controls={x:0,y:0};pressed={};
  document.getElementById('act').classList.remove('held');
  document.getElementById('knob').style.transform='translate(0,0)';
  document.getElementById('overlay').classList.remove('open');
  drawer.hidden=true;selectedPanel='';
  window.wwBgm?.pause();refreshStats();window.wwRenderCharacterNav?.();window.wwApplyLanguage?.();
  if(window.home3D?.active){window.home3D.setBadge(localStorage.getItem(previewKey)==='1')}
 }
 function leaveHome(){
  drawer.hidden=true;selectedPanel='';home.hidden=true;window.__homeIsOpen=false;
  if(state.hearts<=0){showPanel('gameover');}else{closePanel();window.wwBgm?.play();}
  updateHUD();
 }
 function previewBadge(){return localStorage.getItem(previewKey)==='1'}
 function openPanel(which){if(which==='album'&&selectedPanel!=='album'){arcPage=0;arcYaw=0;}selectedPanel=which;drawer.hidden=false;renderPanel(which);document.getElementById('homeDrawerClose').focus({preventScroll:true})}

 // Collection v0.2.36. One circular display for each discovered person.
 // QA samples are view-only, and never written to the game's album.
 const arcQA=new URLSearchParams(location.search).get('collection-preview')==='1';
 const arcSample=[[1,2,4,8],[1,3,5],[1,2,6]];
 let arcYaw=0,arcPage=0,arcStop=0,arcFrame=0,arcDrag=null,arcFlip=false,arcPageDrag=null,arcAnimating=false,arcFlipAt=-999;
 const arcStep=Math.PI/4,arcTau=Math.PI*2;
 const arcThemes=[
  ['kr','한국','#d0e1d8','#9ed6c5'],['in','인도','#d9b87f','#c99267'],['ug','우간다','#c58d57','#b7b676']
 ];
 const arcHeld=(i,k)=>ownedAt(i,k)||(arcQA&&!!arcSample[i]?.includes(k));
 const arcPages=()=>{
  const result=[];
  for(const key of Object.keys(state.album||{})){
   if(!state.album[key])continue;
   const i=roster.findIndex(c=>key.startsWith(c.id+'_'));
   if(i>=0&&!result.includes(i))result.push(i);
  }
  if(arcQA)for(let i=0;i<arcSample.length;i++)if(!result.includes(i))result.push(i);
  return result;
 };
 const arcCount=i=>Array.from({length:8},(_,j)=>arcHeld(i,j+1)).filter(Boolean).length;
 const arcMod=(a,n)=>((a%n)+n)%n;
 const arcFront=()=>arcMod(Math.round(-arcYaw/arcStep),8)+1;
 const arcPerson=()=>arcPages()[arcPage];
 const arcEscape=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function arcArt(ch,k){
  if(k===1&&ch.image)return '<img class="arc-original" draggable="false" src="'+ch.image+'" alt="'+arcEscape(ch.name)+'">';
  if(ch.previewSheet)return previewArt(ch,k).replace('loading="lazy"','loading="eager" draggable="false"');
  return '<span class="arc-art-missing">✦</span>';
 }
 function arcMark(theme){
  if(theme==='kr')return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="28"/><path d="M50 17Q66 34 83 50Q66 66 50 83Q34 66 17 50Q34 34 50 17Z"/><path d="M50 26Q67 50 50 74Q33 50 50 26ZM26 50Q50 33 74 50Q50 67 26 50Z"/><circle cx="50" cy="50" r="9"/></g></svg>';
  if(theme==='in')return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="50" cy="50" r="34"/>'+Array.from({length:8},(_,j)=>'<path transform="rotate('+j*45+' 50 50)" d="M50 50Q28 25 50 13Q72 25 50 50Z"/>').join('')+'<circle cx="50" cy="50" r="9"/></g></svg>';
  if(theme==='ug')return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M50 12L88 50 50 88 12 50ZM50 23L77 50 50 77 23 50ZM50 34L66 50 50 66 34 50Z"/><path d="M12 50L24 38 36 50 24 62ZM88 50L76 38 64 50 76 62ZM50 12L38 24 50 36 62 24ZM50 88L38 76 50 64 62 76Z"/></g></svg>';
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="50" cy="50" r="34"/><path d="M50 12L88 50 50 88 12 50ZM50 26L74 50 50 74 26 50Z"/><circle cx="50" cy="50" r="8"/></g></svg>';
 }
 // Existing preview sheets already contain their own frames and profile text.
 // Display that original card face exactly once, at its native crop ratio.
 function arcRatio(i,k){
  const ch=roster[i],r=ch.previewRects?.[k-1];
  return k===1&&ch.image ? .75 : (r&&r[3]>0 ? r[2]/r[3] : .75);
 }
 function arcCard(i,k){
  const ch=roster[i],gold=k===8,theme=arcThemes[i]?.[0]||'neutral',raw=k===1&&!!ch.image,source=!raw&&!!ch.previewSheet;
  const art=arcArt(ch,k);
  return '<div class="arc-card-face arc-face-front '+(source?'arc-source-face':raw?'arc-portrait-face':'arc-unmade-face')+' '+(gold?'is-gold':'')+'">'+art+(raw?'<span class="arc-portrait-name">'+arcEscape(ch.name)+'</span>':'')+'</div>'+
   '<div class="arc-card-face arc-face-back '+(gold?'is-gold':'')+'"><div class="arc-back-inner"><span>WAGU WAGU</span>'+arcMark(theme)+'<b>'+(gold?'GOLD COLLECTION':'COLLECTION')+'</b></div></div>';
 }
 function arcProfile(i){
  const ch=roster[i],items=[];
  if(arcHeld(i,1)){if(ch.age)items.push(ch.age+'세');if(ch.height)items.push(ch.height+'cm');}
  for(let k=2;k<=8;k++)if(arcHeld(i,k)&&ch.topics?.[k-1])items.push(ch.topics[k-1]);
  return '<section class="arc-profile"><div class="arc-name"><strong>'+arcEscape(ch.name)+'</strong><span>'+arcEscape(ch.country)+'</span></div><div class="arc-engraving">'+items.map(v=>'<span>'+arcEscape(v)+'</span>').join('')+'</div></section>';
 }
 function collectionHTML(){
  const pages=arcPages();
  if(!pages.length)return '<div class="arc-empty-page"><div class="arc-empty-emblem">'+arcMark('neutral')+'</div><div>첫 카드를 기다리는 수납장</div><button data-home-action="arc-exit" class="arc-explore">탐험으로 돌아가기</button></div>';
  arcPage=Math.max(0,Math.min(pages.length-1,arcPage));
  const i=pages[arcPage],ch=roster[i],theme=arcThemes[i]||['neutral',ch.country,'#d9c49d','#8db1a3'],slots=[];
  for(let k=1;k<=8;k++){
   const held=arcHeld(i,k),gold=k===8;
   slots.push('<div class="arc-slot '+(gold?'arc-gold-slot':'')+'" data-arc-slot="'+k+'" role="'+(held?'button':'img')+'" tabindex="'+(held?'0':'-1')+'" aria-label="'+arcEscape(ch.name)+' '+(gold?'골드 카드':held?(ch.topics?.[k-1]||'수집 카드'):'빈 슬롯')+'"><div class="arc-groove"><i></i>'+(gold?'<b>✦</b>':'')+'</div>'+(held?'<div class="arc-card-object" style="--arc-ratio:'+arcRatio(i,k)+'">'+arcCard(i,k)+'</div>':'')+'</div>');
  }
  return '<div class="arc-root arc-theme-'+theme[0]+'" style="--arc-metal:'+theme[2]+';--arc-accent:'+theme[3]+'">'+
   (arcQA?'<div class="arc-qa">디자인 검수 · 예시 카드</div>':'')+
   '<div class="arc-page-band" data-arc-page-band><button class="arc-page-arrow" data-home-action="arc-prev" aria-label="이전 수납장" '+(arcPage===0?'disabled':'')+'>‹</button><div class="arc-page-info"><span class="arc-page-dots">'+pages.map((_,j)=>'<i class="'+(j===arcPage?'active':'')+'"></i>').join('')+'</span><span class="arc-count">'+arcCount(i)+' / 8</span></div><button class="arc-page-arrow" data-home-action="arc-next" aria-label="다음 수납장" '+(arcPage===pages.length-1?'disabled':'')+'>›</button></div>'+
   '<div class="arc-wheel" tabindex="0" aria-label="회전식 카드 수납장, 좌우로 돌리기"><div class="arc-gallery-halo"></div><div class="arc-gallery-rays"></div><div class="arc-floor-shadow"></div><div class="arc-scene"><div class="arc-orbit"><div class="arc-deck" aria-hidden="true">'+Array.from({length:12},(_,j)=>'<i class="arc-deck-layer" style="--layer:'+j+'"></i>').join('')+'<div class="arc-deck-top"><div class="arc-deck-inner"></div>'+arcMark(theme[0])+'</div>'+Array.from({length:48},(_,j)=>'<i class="arc-edge-tile" style="--edge-angle:'+j*7.5+'deg;--edge-j:'+j+'"></i>').join('')+'</div>'+slots.join('')+'</div></div></div>'+
   '<div class="arc-page-bottom" data-arc-page-band>'+arcProfile(i)+'</div><div class="arc-viewer" hidden></div></div>';
 }
 function arcCancel(){
  clearTimeout(arcStop);cancelAnimationFrame(arcFrame);arcStop=0;arcFrame=0;arcDrag=null;arcPageDrag=null;arcAnimating=false;
 }
 function arcDraw(){
  const wheel=content.querySelector('.arc-wheel');if(!wheel)return;
  const w=wheel.clientWidth,h=wheel.clientHeight;if(w<2||h<2)return;
  // All objects share the same 3D origin and camera. A slot is a tangent
  // to the circle: card width is below the non-intersection limit 2R*tan(22.5°).
  const r=Math.min(w*.325,142,h*.265),cardW=r*.74,deckR=r*1.17;
  const maxCardH=cardW/.67,foot=Math.min(h*.70,Math.max(h*.54,(h+maxCardH*.84)/2-7));
  wheel.style.setProperty('--arc-radius',r+'px');
  wheel.style.setProperty('--arc-card-w',cardW+'px');
  wheel.style.setProperty('--arc-deck-size',(deckR*2)+'px');
  wheel.style.setProperty('--arc-deck-radius',deckR+'px');
  wheel.style.setProperty('--arc-edge-width',(2*Math.PI*deckR/48+.65)+'px');
  wheel.style.setProperty('--arc-origin-y',foot+'px');
  const orbit=wheel.querySelector('.arc-orbit');
  if(orbit)orbit.style.transform='rotateY('+arcYaw+'rad)';
  for(const el of wheel.querySelectorAll('[data-arc-slot]')){
   const k=Number(el.dataset.arcSlot),a=(k-1)*arcStep;
   el.style.transform='translate3d('+(Math.sin(a)*r).toFixed(3)+'px,0px,'+(Math.cos(a)*r).toFixed(3)+'px) rotateY('+a+'rad)';
   el.style.zIndex='auto';
   el.classList.toggle('arc-front-slot',k===arcFront());
  }
 }
 function arcShow(k){
  if(selectedPanel!=='album'||drawer.hidden||arcDrag||arcAnimating)return;
  const i=arcPerson(),viewer=content.querySelector('.arc-viewer');
  if(i===undefined||!viewer||!arcHeld(i,k))return;
  selectedCard=k;arcFlip=false;arcFlipAt=-999;viewer.classList.remove('arc-flipped');
  viewer.innerHTML='<button class="arc-view-close" data-home-action="arc-close-card" aria-label="카드 감상 닫기">×</button><button class="arc-view-card" style="--arc-ratio:'+arcRatio(i,k)+'" aria-label="카드 앞뒷면 뒤집기"><div class="arc-view-object">'+arcCard(i,k)+'</div></button>';
  viewer.hidden=false;drawer.classList.add('arc-viewing');
  viewer.querySelector('.arc-view-card')?.focus({preventScroll:true});
 }
 function arcClose(){
  const v=content.querySelector('.arc-viewer');if(!v||v.hidden)return false;
  v.hidden=true;v.innerHTML='';arcFlip=false;drawer.classList.remove('arc-viewing');return true;
 }
 function arcSettle(target,open=true){
  clearTimeout(arcStop);cancelAnimationFrame(arcFrame);
  const from=arcYaw,delta=target-from,begin=performance.now();arcAnimating=true;
  const frame=t=>{
   const q=Math.min(1,Math.max(0,(t-begin)/420));arcYaw=from+delta*(1-Math.pow(1-q,3));arcDraw();
   if(q<1){arcFrame=requestAnimationFrame(frame);return;}
   arcYaw=target;arcAnimating=false;arcDraw();
   if(open)arcStop=setTimeout(()=>arcShow(arcFront()),430);
  };
  arcFrame=requestAnimationFrame(frame);
 }
 function arcMovePage(delta){
  const pages=arcPages(),next=Math.max(0,Math.min(pages.length-1,arcPage+delta));
  if(next===arcPage)return;
  arcCancel();arcClose();arcPage=next;arcYaw=0;renderPanel('album');
 }
 function arcWire(){
  arcCancel();drawer.classList.remove('arc-viewing');const wheel=content.querySelector('.arc-wheel');if(!wheel)return;
  arcDraw();requestAnimationFrame(()=>{if(selectedPanel==='album'&&!drawer.hidden)arcDraw();});
  wheel.addEventListener('pointerdown',e=>{
   if(e.button>0||arcDrag)return;
   clearTimeout(arcStop);cancelAnimationFrame(arcFrame);arcAnimating=false;
   arcDrag={id:e.pointerId,x:e.clientX,y:e.clientY,from:arcYaw,moved:false,lastX:e.clientX,lastT:performance.now(),velocity:0,slot:e.target.closest('[data-arc-slot]')?.dataset.arcSlot};
   try{wheel.setPointerCapture(e.pointerId);}catch(_){}
  });
  wheel.addEventListener('pointermove',e=>{
   if(!arcDrag||e.pointerId!==arcDrag.id)return;
   const dx=e.clientX-arcDrag.x,dy=e.clientY-arcDrag.y;
   if(Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)*.7)arcDrag.moved=true;
   if(!arcDrag.moved)return;
   const now=performance.now(),elapsed=Math.max(8,now-arcDrag.lastT);arcDrag.velocity=arcDrag.velocity*.45+((e.clientX-arcDrag.lastX)/elapsed)*.55;arcDrag.lastX=e.clientX;arcDrag.lastT=now;
   arcYaw=arcDrag.from+dx*arcTau/Math.max(360,wheel.clientWidth*1.35);arcDraw();e.preventDefault();
  });
  const end=e=>{
   if(!arcDrag||e.pointerId!==arcDrag.id)return;
   const d=arcDrag;arcDrag=null;
   if(e.type!=='pointerup'){arcSettle(Math.round(arcYaw/arcStep)*arcStep,false);return;}
   if(d.moved){const v=performance.now()-d.lastT<100?d.velocity:0,glide=Math.max(-arcStep,Math.min(arcStep,v*.26));arcSettle(Math.round((arcYaw+glide)/arcStep)*arcStep);return;}
   if(d.slot){
    const k=Number(d.slot),base=-(k-1)*arcStep;
    const target=base+Math.round((arcYaw-base)/arcTau)*arcTau;
    arcSettle(target);
   }
  };
  for(const type of ['pointerup','pointercancel','lostpointercapture'])wheel.addEventListener(type,end);
  wheel.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();arcSettle(Math.round(arcYaw/arcStep)*arcStep+(e.key==='ArrowLeft'?arcStep:-arcStep));}
   if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();const k=Number(e.target.closest('[data-arc-slot]')?.dataset.arcSlot)||arcFront();const base=-(k-1)*arcStep;arcSettle(base+Math.round((arcYaw-base)/arcTau)*arcTau);}
  });
  for(const band of content.querySelectorAll('[data-arc-page-band]')){
   band.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;arcPageDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{band.setPointerCapture(e.pointerId)}catch(_){}});
   band.addEventListener('pointerup',e=>{if(!arcPageDrag||e.pointerId!==arcPageDrag.id)return;const dx=e.clientX-arcPageDrag.x,dy=e.clientY-arcPageDrag.y;arcPageDrag=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy))arcMovePage(dx<0?1:-1);});
   band.addEventListener('pointercancel',()=>arcPageDrag=null);
  }
  const viewer=content.querySelector('.arc-viewer');
  viewer?.addEventListener('click',e=>{if(e.target.closest('.arc-view-card')){if(performance.now()-arcFlipAt<300)return;arcFlip=!arcFlip;viewer.classList.toggle('arc-flipped',arcFlip);}else if(e.target===viewer)arcClose();});
  viewer?.addEventListener('pointerdown',e=>{if(e.target.closest('.arc-view-card'))arcPageDrag={id:e.pointerId,x:e.clientX,y:e.clientY};});
  viewer?.addEventListener('pointerup',e=>{if(arcPageDrag?.id===e.pointerId&&Math.abs(e.clientX-arcPageDrag.x)>38){arcFlipAt=performance.now();arcFlip=!arcFlip;viewer.classList.toggle('arc-flipped',arcFlip);}arcPageDrag=null;});
 }
 window.addEventListener('resize',()=>{if(selectedPanel==='album'&&!drawer.hidden)arcDraw();});
 function renderPanel(which=selectedPanel){
  if(!which)return;
  drawer.classList.toggle('arc-collection',which==='album');if(which!=='album'){arcCancel();drawer.classList.remove('arc-viewing');}
  title.textContent=({character:'캐릭터',shop:'상점',expedition:'탐험',settings:'설정',album:'컬렉션'})[which]||'메뉴';
  let html='';
  if(which==='character'){
   html=`<div class="banner"><strong>나만의 애벌레</strong><div>좌우로 밀어 애벌레의 앞·옆·뒷모습을 살펴봐.</div><canvas id="homeCharacterPreview" aria-label="게임 캐릭터 사선 측면 2D 회전" role="img" style="display:block;width:100%;height:clamp(145px,26vh,220px);touch-action:pan-y;cursor:grab"></canvas></div>
   <div class="small-stat"><div><small>현재 레벨</small><b>Lv.${state.level}</b></div><div><small>최대 몸 길이</small><b>${bodyMax()}</b></div></div>
   <h3>영구 보유 · 캐릭터 스킨</h3><div class="skin-grid">${[{id:'peach',label:'기본 복숭아',price:0,color:'#f6c59e'},{id:'mint',label:'민트 꼬물이',price:120,color:'#91cfba'},{id:'coral',label:'핑크 산호',price:180,color:'#f2a1b3'},{id:'gold',label:'황금 꼬물이',price:400,color:'#dfbd76'}].map(x=>`<button class="skin-pick ${state.skins?.equipped===x.id?'chosen':''}" data-home-action="skin-${x.id}"><i style="background:${x.color}"></i><span>${x.label}</span><small>${state.skins?.owned?.includes(x.id)?(state.skins?.equipped===x.id?'장착 중':'장착하기'):x.price+' 코인'}</small></button>`).join('')}</div>
   <h3>꾸미기 미리보기</h3><label class="toggle"><span>✦ 반짝 배지 (미리보기)<br><small>구매·장착 아이템이 아닌 시연 기능</small></span><input type="checkbox" id="homeBadgeSwitch" ${previewBadge()?'checked':''}></label>
   <button type="button" class="home-action" data-home-action="turn-left">↶ 왼쪽 회전</button><button type="button" class="home-action" data-home-action="turn-right">오른쪽 회전 ↷</button>
   <p class="notice">본게임 캐릭터의 사선 측면 2D 미리보기야. 다리와 몸통이 보이며 좌우 회전만 가능해. 배지는 미리보기 전용이야.</p><button type="button" class="home-action" data-home-action="album">▣ 수집 카드 보기</button>`;
  }else if(which==='shop'){
   html=`<div class="banner"><strong>탐험 상점</strong><div>보유 <b style="color:#f8daa4">${num(state.coins)} 코인</b> · 강화는 현재 카드 맵에서만 유지돼.</div></div>
   <h3>이번 맵 성장 강화</h3>
   ${shopTile('capacity','포만 용량 +3','삼키기 전까지 더 많이 갉아먹어','⚗')}
   ${shopTile('speed','씹는 속도','지형을 더 빠르게 갉아먹어','↗')}
   ${shopTile('digest','소화 시간 감소','삼키기 멈춤을 짧게','◷')}
   ${shopTile('biteArea','먹는 폭 강화','레벨에 따라 더 넓은 크래커를 갉아먹어','◈')}
   ${shopTile('moveSpeed','이동 속도','내 땅에서 더 빠르게 이동','➤')}
   <h3>코인 획득 규칙</h3>
    <div class="info-card ww-home-coin-rules">
      <b>🪙 큰 크래커를 떨어뜨리면 더 많은 코인!</b>
      <div class="ww-coin-rules"><div><b>10~19칸</b><strong>+5</strong></div><div><b>20~29칸</b><strong>+12</strong></div><div><b>30~49칸</b><strong>+25</strong></div><div><b>50~99칸</b><strong>+45</strong></div><div><b>100칸 이상</b><strong>+80</strong></div></div>
      <small>100칸부터 추가 50칸마다 +25코인</small>
      <p>⭐ 맵에서 반짝이는 황금 코인 위치를 점령하면 <b>코인 1개당 +10</b>을 더 받아.</p>
      <small>몬스터 포획 +22/마리 · 레벨업 +25 · 구역 해금 +75 · 맵 완료 +120</small>
    </div>
    <h3>코인 모으기</h3><div class="info-card"><b>✦ 오늘의 탐험 선물 · +30 코인</b><br>하루 1회 무료로 받을 수 있어.<br><button type="button" class="home-action" data-home-action="daily-coin" ${dailyUsed()?'disabled':''}>${dailyUsed()?'오늘 수령 완료':'무료 30코인 받기'}</button></div>
   <div class="info-card"><b>▶ 짧은 보상 광고 · 연동 예정</b><br>광고 완료 시에만 게임 코인을 지급할 예정이야. 현재는 광고 송출·보상이 연결되지 않았어.</div>
   <p class="notice">실제 결제와 광고는 작동하지 않아. 스킨은 구매 시 모든 맵에서 유지하는 별도 꾸미기 메뉴로 운영할 예정이야.</p>`;
  }else if(which==='expedition'){
   html=`<div class="small-stat"><div><small>최고 점령률</small><b>${best.toFixed(1)}%</b></div><div><small>몬스터 포획</small><b>${num(state.captures||0)}</b></div><div><small>현재 스테이지</small><b>${state.stage}</b></div><div><small>현재 레벨</small><b>${state.level}</b></div></div>
   <div class="info-card"><b>지금 점령한 영역</b><br>${capture().toFixed(1)}% / 목표 ${GOAL}%<br><small>최고 점령률은 이 기기에 기록돼.</small></div>
   <button type="button" class="home-action" data-home-action="album">▣ 수집 카드 열기</button>`;
  }else if(which==='settings'){
   html=`<div class="banner ww-lab-entry"><strong>🧪 몬스터·진화 테스트장</strong><div>1~6구역 몬스터를 바로 보고, 진화 1~5단계를 선택해 직접 움직여 볼 수 있어요. 일반 게임 저장과 분리돼요.</div><button type="button" class="home-action" data-home-action="test-lab">▶ 테스트장 입장</button></div><div class="info-card"><b>화면 설정</b><br>게임 플레이는 기존 세로 전체화면을 유지해.</div>
   <button type="button" class="home-action" data-home-action="fullscreen">⛶ 전체 화면 전환</button>
   <button type="button" class="home-action" data-home-action="toggle-minimap">▦ 미니맵 ${miniOn?'끄기':'켜기'}</button>
   <div class="info-card"><b>조작</b><br>왼손 조이스틱으로 이동 · 오른손 버튼 한 번 누르면 앙 한 입 · 길게 누르면 연속 갉아먹기 · PC 방향키/WASD + Space</div>
   <div class="info-card"><b>장기 탐험 저장</b><br>5초마다 자동 저장해. 하트를 모두 잃으면 이번 구역의 점령 진행은 끝나지만, 코인과 수집 카드는 남아. 기기/브라우저별 로컬 저장이므로 데이터를 지우면 복원되지 않을 수 있어.<br><button type="button" class="home-action" data-home-action="save-export">↓ 진행 데이터 백업</button><label class="home-action" style="display:inline-block;cursor:pointer">↑ 백업 파일 불러오기<input id="homeSaveImport" type="file" accept=".json,application/json" style="display:none"></label></div>
   <p class="notice">와구와구 · 모든 언어에서 하나의 앱으로 즐길 수 있어. 광고 기능은 실제 앱 출시 전 연결 예정.</p>`;
  }else if(which==='album'){
   html=collectionHTML();
  }
  if(which==='settings')html=window.wwSettingsMarkup?.()+html;
  content.innerHTML=html;window.wwTranslate?.(drawer);if(which==='album')arcWire();
 }
 function closeDrawer(){arcCancel();drawer.classList.remove('arc-viewing','arc-collection');drawer.hidden=true;selectedPanel='';if(window.__homeIsOpen)window.wwBgm?.pause()}
 home.addEventListener('click',e=>{const p=e.target.closest('[data-home-panel]');if(p){e.preventDefault();openPanel(p.dataset.homePanel)}});
 document.getElementById('homePlay').addEventListener('click',leaveHome);
 document.getElementById('homeDrawerClose').addEventListener('click',closeDrawer);
 drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer()});
 drawer.addEventListener('change',async e=>{
  if(e.target.id==='wwLanguage'){window.wwSetLanguage?.(e.target.value);renderPanel('settings');return;}
  if(e.target.id==='homeSaveImport'&&e.target.files?.[0]){
   try{
    const raw=await e.target.files[0].text(),parsed=JSON.parse(raw);
    if(parsed.version!==2||!Array.isArray(parsed.tiles)||parsed.tiles.length!==parsed.mapCols*parsed.mapRows||parsed.tiles.length>2000000||!(parsed.stage>=1&&parsed.stage<=64))throw Error('백업 형식이 달라');
    const previous=localStorage.getItem(SAVE_KEY);
    if(previous)localStorage.setItem(SAVE_KEY+'-before-import',previous);
    localStorage.setItem(SAVE_KEY,raw);window.location.reload();
   }catch(err){alert('백업 파일을 확인해줘. 잘못된 파일은 불러올 수 없어.')}
   return;
  }
  if(e.target.id==='homeBadgeSwitch'){
   try{localStorage.setItem(previewKey,e.target.checked?'1':'0')}catch(err){}
   window.home3D?.setBadge(e.target.checked)
 }});
 drawer.addEventListener('input',e=>{if(e.target.id==='wwBgmVolume'||e.target.id==='wwSfxVolume'){const kind=e.target.id==='wwBgmVolume'?'bgm':'sfx';window.wwSetVolume?.(kind,e.target.value);const out=document.getElementById(kind==='bgm'?'wwBgmOutput':'wwSfxOutput');if(out)out.textContent=e.target.value;}});
 drawer.addEventListener('click',e=>{
  const b=e.target.closest('[data-home-action],[data-do]');if(!b)return;
  e.preventDefault();const action=b.dataset.homeAction||b.dataset.do;
  if(action==='test-lab'){closeDrawer();window.__startWaguLab?.();return;}   if(action.startsWith('buy-')){buy(action.slice(4));refreshStats();renderPanel('shop');return}
  if(action==='album'){openPanel('album');return}
  if(action==='arc-prev'||action==='arc-next'){arcMovePage(action==='arc-prev'?-1:1);return;}
  if(action==='arc-close-card'){arcClose();return;}
  if(action==='arc-exit'){closeDrawer();return;}
  if(action.startsWith('skin-')){
   const skin=action.slice(5),prices={peach:0,mint:120,coral:180,gold:400};
   if(!(skin in prices))return;
   if(!state.skins)state.skins={owned:['peach'],equipped:'peach'};
   if(!state.skins.owned.includes(skin)){
    if(state.coins<prices[skin])return;
    state.coins-=prices[skin];state.skins.owned.push(skin);
   }
   state.skins.equipped=skin;save();updateHUD();refreshStats();renderPanel('character');return;
  }
  if(action==='save-export'){
   save();const data=localStorage.getItem(SAVE_KEY);if(!data)return;
   const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='wagjak-stage-'+state.stage+'-backup.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);return;
  }
  if(action==='daily-coin'){if(!dailyUsed()){try{localStorage.setItem(dailyKey,dayId())}catch(e){}state.coins+=30;save();updateHUD();refreshStats();renderPanel('shop');}return}
  
  
  if(action==='turn-left'||action==='turn-right'){window.home3D?.setYaw(window.home3D.getYaw()+(action==='turn-left'?-1:1)*Math.PI/2);return}
  if(action==='toggle-minimap'){miniOn=!miniOn;mini.classList.toggle('visible',miniOn);renderPanel('settings');return;}
  if(action==='fullscreen'){doAction('screen');return}
 });
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&window.__homeIsOpen&&!drawer.hidden){if(!arcClose())closeDrawer();e.preventDefault()}});
 window.__openLandHome=openHome;
 window.__refreshLandHomePanel=renderPanel;
 window.__refreshLandHomeStats=refreshStats;
 window.__collectionTest={rosterCount:()=>arcPages().length,owned:totalOwned,open:()=>openPanel('album'),select:(i)=>{const j=arcPages().indexOf(i);if(j>=0){arcPage=j;arcYaw=0;renderPanel('album');}},snapshot:()=>({pages:arcPages(),page:arcPage,front:arcFront(),qa:arcQA,owned:totalOwned(),yaw:arcYaw})};
 window.__landHomeTest={getOpen:()=>window.__homeIsOpen,panel:()=>selectedPanel,stats:()=>({best,level:state.level,coins:state.coins,badge:previewBadge(),modelActive:!!window.home3D?.active}),openPanel,enterGame:leaveHome,returnHome:openHome};
 openHome();
 if(arcQA)openPanel('album');
})();
