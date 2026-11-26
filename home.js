/* Home lobby — current collection and navigation. The existing game world, rules, saves and shop remain authoritative.
   Layout/menu order deliberately mirrors hell-drop V0.7. */
(function(){
 'use strict';
 const home=document.getElementById('landHome'),drawer=document.getElementById('homeDrawer'),content=document.getElementById('homeDrawerBody'),title=document.getElementById('homeDrawerTitle');
 if(!home)return;
 const recordsKey='land-conquest-home-records-v1',previewKey='land-conquest-home-badge-preview-v1';
 let best=0,selectedPanel='';
 const amara={id:'CHAR_003',name:'아마라',english:'AMARA',country:'우간다 · 가상 설정',age:16,
   topics:['우간다 · 16세 · 학생','취미: 동화책 읽기·텃밭','명랑함 · 친화력','화목한 가족','요리 · 요리 메모','책임감 · 봉사','부탁을 거절하기 어려움','동네 식당 겸 공부방']};
 const roster=Array.from({length:8},(_,i)=>{
   const ch=characters[i]||(i===2?amara:null)||{id:'CHAR_'+String(i+1).padStart(3,'0'),name:'미공개 인물 '+String(i+1).padStart(2,'0'),english:'COMING SOON',country:'새로운 이야기',topics:Array.from({length:8},(_,j)=>j===7?'스페셜 카드':'이야기 '+(j+1))};
   return ch;
 });
 const ownedAt=(i,k)=>!!state.album[roster[i].id+'_'+String(k).padStart(2,'0')];
 const ownedCount=i=>Array.from({length:8},(_,k)=>ownedAt(i,k+1)).filter(Boolean).length;
 const totalOwned=()=>roster.reduce((a,_,i)=>a+ownedCount(i),0);
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
 const arcSample=Array.from({length:3},()=>[1,2,3,4,5,6,7,8]);
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
  return 2/3;
 }
 const arcProfiles=[{"meta":["유해나","18세","한국","162~163cm"],"sent":["5월 17일생으로 혈액형은 A형이다.","화목고등학교 음악부에서 피아노를 연주한다.","떡볶이와 치킨, 딸기우유를 좋아하고 벌레를 무서워한다.","피아노와 노래를 즐기며 영어에 강하지만 수학은 어려워한다.","한옥마을과 바닷가를 좋아하고 할머니의 목걸이를 아낀다.","인형에게 하루 이야기를 들려주고 잠드는 습관이 있다.","다정하고 유머 있는 사람을 좋아하지만 승부욕도 강하다.","직접 만든 노래로 사람들에게 힘을 주는 가수를 꿈꾼다."],"full":"화목고등학교 음악부에서 피아노와 노래를 즐긴다. 영어에 강하지만 수학은 어려워하고, 떡볶이와 딸기우유를 좋아한다. 할머니의 목걸이를 소중히 여기며 승부욕도 강하다. 언젠가 직접 만든 노래로 누군가에게 힘을 주는 가수가 되고 싶다."},{"meta":["아니카","20세","인도","157cm"],"sent":["밝고 따뜻하며 관찰력이 좋다.","카페 탐방과 아이스커피, 셀카를 즐긴다.","인디 팝과 라이브 공연, 저녁 산책을 좋아한다.","보라색과 도시적인 패션을 즐긴다.","여자 크리켓을 응원하며 활동적이다.","가족과 함께하는 축제와 인도 가정식을 좋아한다.","산과 자연을 여행하며 사진과 메모를 남긴다.","패션 사진작가가 되어 자신의 화보집을 만드는 것이 꿈이다."],"full":"밝고 따뜻하며 호기심과 관찰력이 뛰어나다. 카페 탐방, 인디 팝과 라이브 공연, 보라색 패션을 즐기며 여자 크리켓을 응원한다. 가족과 축제를 소중히 여기고 여행의 순간을 사진으로 남긴다. 언젠가 자신의 화보집을 만드는 패션 사진작가가 되고 싶다."},{"meta":["아마라","16세","우간다",""],"sent":["우간다의 가상 소도시에서 자란 학생이다.","동생들에게 동화책을 읽어주고 텃밭을 가꾼다.","명랑하고 활발하며 곤란한 사람에게 먼저 다가간다.","넉넉하지 않지만 서로 챙기는 화목한 가족과 산다.","요리와 요리 메모 쓰기를 즐긴다.","주말에는 공동부엌과 나눔터에서 책임감 있게 봉사한다.","부탁을 거절하기 어려워 공부와 휴식을 미루곤 한다.","누구나 쉬어갈 수 있는 작은 식당 겸 공부방을 꿈꾼다."],"full":"넉넉하지 않지만 서로 아끼는 가족과 지내며, 동화책 읽어주기와 텃밭 가꾸기, 요리를 좋아한다. 밝고 책임감이 강해 주말마다 공동부엌과 나눔터에서 봉사한다. 부탁을 거절하지 못해 자기 공부와 휴식을 미루기도 한다. 작은 동네 식당 겸 공부방을 운영하는 것이 꿈이다."}];
 const cardFrontPath=(i,k)=>i===2?'./assets/cards/amara-v042/amara_'+String(k).padStart(2,'0')+'.webp':i<2?'./assets/cards/collection-v043/'+['kr','in'][i]+'_'+String(k).padStart(2,'0')+'.webp':null;
 const cardBackPath=(i,k)=>i<3?'./assets/cards/collection-v043/'+['kr','in','ug'][i]+'_back_'+String(k).padStart(2,'0')+'.svg':null;
 function arcCard(i,k){
  const ch=roster[i],front=cardFrontPath(i,k),back=cardBackPath(i,k),gold=k===8,theme=arcThemes[i]?.[0]||'neutral';
  const img=(src,alt)=>'<img class="arc-complete-art" src="'+arcEscape(src)+'" alt="'+arcEscape(alt)+'" draggable="false">';
  if(front&&back)return '<div class="arc-card-face arc-face-front arc-complete-face">'+img(front,ch.name+' '+k+'번 앞면')+'</div><div class="arc-card-face arc-face-back arc-complete-face '+(gold?'is-gold':'')+'">'+img(back,ch.name+' '+k+'번 뒷면')+'</div>';
  return '<div class="arc-card-face arc-face-front">'+arcArt(ch,k)+'</div><div class="arc-card-face arc-face-back"><div class="arc-back-inner"><span>WAGU WAGU</span>'+arcMark(theme)+'</div></div>';
 }
 function arcProfile(i){
  const ch=roster[i],p=arcProfiles[i];if(!p)return '<section class="arc-profile"><strong>'+arcEscape(ch.name)+'</strong></section>';
  const own=k=>arcHeld(i,k),m=p.meta,all=Array.from({length:8},(_,j)=>own(j+1)).every(Boolean);
  const meta=[m[0],own(1)?m[1]:'',own(1)?m[2]:'',(i===0?own(2):own(1))?m[3]:''].filter(Boolean);
  const story=all?p.full:p.sent.filter((v,j)=>own(j+1)).join(' ');
  return '<section class="arc-profile arc-story"><div class="arc-story-meta"><strong>'+arcEscape(meta.shift())+'</strong><span>'+arcEscape(meta.join(' · '))+'</span></div><p class="arc-story-text">'+arcEscape(story)+'</p></section>';
 }
 // v0.2.38: fixed radial geometry, exactly as the approved top-view sketch.
 // Each upright card lies IN a plane through the rotation axis, not a tangent.
 // All projections are orthographic and use the same camera for the deck,
 // grooves, artwork, thin paper edges and the back of the cards.
 const RAD={R:112,inner:15,outer:108,cardInner:18,cardOuter:104,H:129,thick:.52,sin:.42,cos:Math.sqrt(1-.42*.42)};
 let arcLift=0,arcLiftCard=0,arcReturnTimer=0,arcReturning=false,arcHintSeen=false;
 const radialGeometry=(a,cx,cy,scale=1)=>{
  const sn=Math.sin(a),cs=Math.cos(a);
  const p=(r,h=0,t=0)=>[cx+scale*(sn*r+cs*t),cy+scale*((cs*r-sn*t)*RAD.sin-h*RAD.cos)];
  return {sn,cs,p,front:sn<0,depth:cs};
 };
 function arcFallbackSvgArt(i,k){
  const ch=roster[i];
  if(k===1&&ch.image)return '<image href="'+arcEscape(ch.image)+'" x="0" y="0" width="62" height="112" preserveAspectRatio="xMidYMid meet"/>';
  return '<path d="M31 36L45 56 31 76 17 56Z" fill="none" stroke="#cfc49d" stroke-width=".8"/>';
 }
 function arcSvgArt(i,k){const path=cardFrontPath(i,k);return path?'<image href="'+path+'" width="62" height="112" preserveAspectRatio="none"/>':arcFallbackSvgArt(i,k)}
 function arcSvgBack(i,k){const path=cardBackPath(i,k);return path?'<image href="'+path+'" width="62" height="112" preserveAspectRatio="none"/>':'<rect width="62" height="112" fill="#193448"/>'}
 function arcRadialHTML(i,theme){
  let grooves='',cards='';
  for(let k=1;k<=8;k++){
   const held=arcHeld(i,k),gold=k===8;
   grooves+='<g data-rad-groove="'+k+'" data-arc-slot="'+k+'" class="arc-radial-hit" role="img" aria-label="'+(gold?'골드 전용 슬롯':'카드 슬롯')+'"><polygon class="rad-groove-rim" fill="'+(gold?'url(#radGold)':theme==='ug'?'#a17b4e':'#98aaa6')+'" stroke="'+(gold?'#ffedbe':theme==='ug'?'#dab57b':'#d1d8c9')+'" stroke-width=".6"/><polygon class="rad-groove-hole" fill="#09161b" stroke="#172529" stroke-width=".6"/></g>';
   if(held)cards+='<g data-rad-card="'+k+'" data-arc-slot="'+k+'" data-rad-owned="1" class="arc-radial-hit" role="button" tabindex="0" aria-label="'+arcEscape(roster[i].name+' '+(gold?'골드 카드':roster[i].topics?.[k-1]||'수집 카드'))+'"><polygon class="rad-card-edge" fill="url(#radPaper)" stroke="#d8c7a5" stroke-width=".25"/><polygon class="rad-card-top" fill="url(#radPaper)" stroke="#d8c7a5" stroke-width=".25"/><g class="rad-card-face"><rect width="62" height="112" rx="1.2" fill="#182835" stroke="#9c927b" stroke-width=".45"/><g class="rad-art-front">'+arcSvgArt(i,k)+'</g><g class="rad-art-back">'+arcSvgBack(i,k)+'</g></g></g>';
  }
  return '<svg class="arc-radial-svg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" aria-label="방사형 회전 카드 수납장"><defs><linearGradient id="radMetal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#15242c"/><stop offset=".22" stop-color="#607b7e"/><stop offset=".46" stop-color="#a8b7a7"/><stop offset=".6" stop-color="#435c62"/><stop offset="1" stop-color="#12232d"/></linearGradient><linearGradient id="radGold"><stop stop-color="#896026"/><stop offset=".32" stop-color="#f6dca0"/><stop offset=".64" stop-color="#b68947"/><stop offset="1" stop-color="#f8df9a"/></linearGradient><linearGradient id="radPaper"><stop stop-color="#c3ab80"/><stop offset=".5" stop-color="#f0e2c6"/><stop offset="1" stop-color="#988b74"/></linearGradient><radialGradient id="radTop" cx=".42" cy=".35" r=".75"><stop stop-color="'+(theme==='in'?'#755d50':theme==='ug'?'#65715b':'#54726e')+'"/><stop offset=".65" stop-color="'+(theme==='in'?'#40323c':theme==='ug'?'#35483f':'#223d4b')+'"/><stop offset="1" stop-color="#102833"/></radialGradient><radialGradient id="radShadow"><stop stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient><linearGradient id="ugWood" x2="0" y2="1"><stop stop-color="#7d4b29"/><stop offset=".25" stop-color="#4c2918"/><stop offset=".65" stop-color="#2b170e"/><stop offset="1" stop-color="#674024"/></linearGradient><radialGradient id="ugTop"><stop stop-color="#825432"/><stop offset=".65" stop-color="#58341f"/><stop offset="1" stop-color="#27170e"/></radialGradient><pattern id="ugGrain" width="28" height="11" patternUnits="userSpaceOnUse"><path d="M-4 2Q8 -1 17 3T32 2M-2 7Q9 4 20 8T32 7" fill="none" stroke="#d6a76c" stroke-opacity=".22" stroke-width=".65"/></pattern><pattern id="ugWeave" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 6L6 0 12 6 6 12Z" fill="#352418" stroke="#caa269" stroke-width="1.1"/><path d="M3 6L6 3 9 6 6 9Z" fill="#b98748"/><path d="M0 0L3 3M9 9L12 12M0 12L3 9M9 3L12 0" stroke="#e0c08a" stroke-width=".65"/></pattern></defs><g class="rad-model"><ellipse class="rad-shadow" cx="0" cy="0" rx="120" ry="24" fill="url(#radShadow)"/><g class="rad-deck" data-rad-rotator="1"><ellipse cx="0" cy="7" rx="112" ry="47.04" fill="'+(theme==='ug'?'#301b10':'#14232c')+'" stroke="#a3875c" stroke-width="1"/><path d="M-112 0 A112 47.04 0 0 0 112 0 L112 7 A112 47.04 0 0 1 -112 7Z" fill="'+(theme==='ug'?'url(#ugWood)':'url(#radMetal)')+'" stroke="#b4b6a0" stroke-width=".6"/><ellipse rx="112" ry="47.04" fill="'+(theme==='ug'?'url(#ugTop)':'url(#radTop)')+'" stroke="url(#radGold)" stroke-width="1.4"/>'+(theme==='ug'?'<ellipse rx="110" ry="46.2" fill="url(#ugGrain)"/><ellipse rx="105" ry="44.1" fill="none" stroke="#d1a66a" stroke-width=".7"/><ellipse rx="98" ry="41.16" fill="none" stroke="#c9a16a" stroke-width=".6"/><g class="ug-weave-rotor" transform="scale(1 .42)"><circle r="102" fill="none" stroke="url(#ugWeave)" stroke-width="5"/><circle r="13" fill="url(#ugWeave)" stroke="#e1bb77" stroke-width=".8"/></g>':'')+'<ellipse rx="108" ry="45.36" fill="none" stroke="#b9d0c4" stroke-opacity=".38" stroke-width=".7"/><ellipse rx="103" ry="43.26" fill="none" stroke="#9eaa96" stroke-opacity=".25" stroke-width=".65"/><g class="rad-motif" color="#c5c8a8" opacity=".55"><svg x="-11" y="-11" width="22" height="22" viewBox="0 0 100 100">'+arcMark(theme).replace('<svg viewBox="0 0 100 100"','<svg width="100" height="100" viewBox="0 0 100 100"')+'</svg></g><ellipse rx="12" ry="5.04" fill="none" stroke="#c6bd91" stroke-width=".7"/><g class="rad-ticks">'+Array.from({length:48},(_,j)=>'<line data-rad-tick="'+j+'" stroke="'+(j%6===0?'#d8cfaa':'#9eada7')+'" stroke-opacity="'+(j%6===0?.75:.35)+'" stroke-width=".6"/>').join('')+'</g></g><g class="rad-grooves">'+grooves+'</g><g class="rad-cards">'+cards+'</g></g></svg>';
 }
 function collectionHTML(){
  const pages=arcPages();
  if(!pages.length)return '<div class="arc-empty-page"><div class="arc-empty-emblem">'+arcMark('neutral')+'</div><div>첫 카드를 기다리는 수납장</div><button data-home-action="arc-exit" class="arc-explore">탐험으로 돌아가기</button></div>';
  arcPage=Math.max(0,Math.min(pages.length-1,arcPage));
  const i=pages[arcPage],ch=roster[i],theme=arcThemes[i]||['neutral',ch.country,'#d9c49d','#8db1a3'];
  return '<div class="arc-root arc-theme-'+theme[0]+'" style="--arc-metal:'+theme[2]+';--arc-accent:'+theme[3]+'">'+
   (arcQA?'<div class="arc-qa" data-arc-page-band>디자인 검수 · 사진 일부 미확정</div>':'')+
   '<div class="arc-page-band" data-arc-page-band><button class="arc-page-arrow" data-home-action="arc-prev" aria-label="이전 수납장" '+(arcPage===0?'disabled':'')+'>‹</button><div class="arc-page-info"><span class="arc-page-dots">'+pages.map((_,j)=>'<i class="'+(j===arcPage?'active':'')+'"></i>').join('')+'</span><span class="arc-count">'+arcCount(i)+' / 8</span></div><button class="arc-page-arrow" data-home-action="arc-next" aria-label="다음 수납장" '+(arcPage===pages.length-1?'disabled':'')+'>›</button></div>'+
   '<div class="arc-wheel arc-radial-wheel" tabindex="0" aria-label="수납장 좌우 회전, 카드 위로 꺼내기, 배경 좌우 페이지 전환"><div class="arc-gallery-halo"></div><div class="arc-gallery-rays"></div>'+arcRadialHTML(i,theme[0])+(arcHintSeen?'':'<div class="arc-pull-hint" aria-hidden="true"><svg viewBox="0 0 40 44"><path d="M8 23L20 11L32 23M8 35L20 23L32 35"/></svg><span>카드를 위로 밀어 확대</span></div>')+'</div>'+
   '<div class="arc-page-bottom" data-arc-page-band>'+arcProfile(i)+'</div><div class="arc-viewer" hidden></div></div>';
 }
 function arcCancel(){
  clearTimeout(arcStop);cancelAnimationFrame(arcFrame);clearTimeout(arcReturnTimer);arcStop=0;arcFrame=0;arcDrag=null;arcPageDrag=null;arcAnimating=false;arcReturning=false;arcLift=0;arcLiftCard=0;
 }
 function arcDraw(){
  const wheel=content.querySelector('.arc-wheel'),svg=wheel?.querySelector('.arc-radial-svg');if(!svg)return;
  const w=wheel.clientWidth,h=wheel.clientHeight;if(w<2||h<2)return;
  const scale=Math.min(w/242,h/226),cx=w*.5,cy=h*.5+scale*37;
  svg.setAttribute('viewBox','0 0 '+w+' '+h);
  svg.querySelector('.rad-model').setAttribute('transform','translate('+cx+' '+cy+') scale('+scale+')');
  svg.querySelector('.rad-shadow').setAttribute('cy','52');
  svg.querySelector('.rad-motif').setAttribute('transform','scale(1 '+RAD.sin+') rotate('+(arcYaw*180/Math.PI)+')');
  const weave=svg.querySelector('.ug-weave-rotor');if(weave)weave.setAttribute('transform','scale(1 '+RAD.sin+') rotate('+(arcYaw*180/Math.PI)+')');
  const poly=(p,arr)=>arr.map(v=>p(...v).map(x=>x.toFixed(3)).join(',')).join(' ');
  const geom=k=>radialGeometry(arcYaw+(k-1)*arcStep,0,0);
  for(const e of svg.querySelectorAll('[data-rad-tick]')){
   const a=arcYaw+Number(e.dataset.radTick)*arcTau/48,g=radialGeometry(a,0,0);
   const q=g.p(105),r=g.p(108);
   e.setAttribute('x1',q[0]);e.setAttribute('y1',q[1]);e.setAttribute('x2',r[0]);e.setAttribute('y2',r[1]);
  }
  for(const e of svg.querySelectorAll('[data-rad-groove]')){
   const k=Number(e.dataset.radGroove),{p}=geom(k),t=k===8?5:3.1;
   e.querySelector('.rad-groove-rim').setAttribute('points',poly(p,[[RAD.inner,0,-t],[RAD.outer,0,-t],[RAD.outer,0,t],[RAD.inner,0,t]]));
   e.querySelector('.rad-groove-hole').setAttribute('points',poly(p,[[17,0,-1.25],[105,0,-1.25],[105,0,1.25],[17,0,1.25]]));
  }
  const layer=svg.querySelector('.rad-cards'),ordered=[...layer.querySelectorAll('[data-rad-card]')].map(e=>({e,k:Number(e.dataset.radCard),g:geom(Number(e.dataset.radCard))})).sort((a,b)=>a.g.depth-b.g.depth);
  for(const {e,k,g} of ordered){
   const {sn,cs,p,front}=g,H=RAD.H,t=RAD.thick,lo=RAD.cardInner,hi=RAD.cardOuter;
   const start=front?hi:lo,sign=front?-1:1,side=front?1:-1;
   const pos=p(start,H,side*t);
   const face=e.querySelector('.rad-card-face');
   face.setAttribute('transform','matrix('+(Math.abs(sn)*(hi-lo)/62).toFixed(6)+' '+(sign*cs*RAD.sin*(hi-lo)/62).toFixed(6)+' 0 '+(RAD.cos*H/112).toFixed(6)+' '+pos[0].toFixed(3)+' '+pos[1].toFixed(3)+')');
   face.setAttribute('visibility',Math.abs(sn)<.006?'hidden':'visible');
   e.querySelector('.rad-art-front').setAttribute('visibility',front?'visible':'hidden');
   e.querySelector('.rad-art-back').setAttribute('visibility',front?'hidden':'visible');
   const edge=cs>=0?hi:lo;
   e.querySelector('.rad-card-edge').setAttribute('points',poly(p,[[edge,0,-t],[edge,0,t],[edge,H,t],[edge,H,-t]]));
   e.querySelector('.rad-card-top').setAttribute('points',poly(p,[[lo,H,-t],[hi,H,-t],[hi,H,t],[lo,H,t]]));
   e.setAttribute('transform','translate(0 '+(k===arcLiftCard?-arcLift/scale:0)+')');
   // Draw the tiny paper edge last so it remains visible at exactly 0 degrees.
   e.appendChild(e.querySelector('.rad-card-edge'));e.appendChild(e.querySelector('.rad-card-top'));
   layer.appendChild(e);
  }
 }
 function arcShow(k){
  if(selectedPanel!=='album'||drawer.hidden||arcDrag||arcReturning)return;
  const i=arcPerson(),viewer=content.querySelector('.arc-viewer');
  if(i===undefined||!viewer||!arcHeld(i,k))return;
  arcHintSeen=true;content.querySelector('.arc-pull-hint')?.remove();arcFlip=false;arcFlipAt=-999;arcLift=0;arcLiftCard=0;arcDraw();viewer.classList.remove('arc-flipped');
  viewer.innerHTML='<button class="arc-view-close" data-home-action="arc-close-card" aria-label="카드 감상 닫기">×</button><button class="arc-view-card" style="--arc-ratio:'+arcRatio(i,k)+'" aria-label="카드 앞뒷면 뒤집기"><div class="arc-view-object">'+arcCard(i,k)+'</div></button><div class="arc-flip-hint">카드를 터치하면 앞·뒷면 전환</div>';
  viewer.classList.remove('arc-returning');viewer.hidden=false;drawer.classList.add('arc-viewing');
  viewer.querySelector('.arc-view-card')?.focus({preventScroll:true});
 }
 function arcClose(immediate=false){
  const v=content.querySelector('.arc-viewer');if(!v||v.hidden)return false;
  if(arcReturning&&!immediate)return true;
  clearTimeout(arcReturnTimer);
  const finish=()=>{v.hidden=true;v.innerHTML='';v.classList.remove('arc-returning');arcFlip=false;arcReturning=false;arcLift=0;arcLiftCard=0;drawer.classList.remove('arc-viewing');arcDraw();};
  if(immediate){finish();return true;}
  arcReturning=true;v.classList.add('arc-returning');arcReturnTimer=setTimeout(finish,300);return true;
 }
 function arcSettle(target){
  clearTimeout(arcStop);cancelAnimationFrame(arcFrame);
  const from=arcYaw,delta=target-from,begin=performance.now(),duration=300+Math.min(300,Math.abs(delta)*170);arcAnimating=true;
  const frame=t=>{
   const q=Math.min(1,Math.max(0,(t-begin)/duration));arcYaw=from+delta*(1-Math.pow(1-q,3));arcDraw();
   if(q<1){arcFrame=requestAnimationFrame(frame);return;}
   arcYaw=((target%arcTau)+arcTau)%arcTau;arcAnimating=false;arcDraw();
  };
  arcFrame=requestAnimationFrame(frame);
 }
 function arcMovePage(delta){
  const pages=arcPages(),next=Math.max(0,Math.min(pages.length-1,arcPage+delta));
  if(next===arcPage)return;
  arcCancel();arcClose(true);arcPage=next;arcYaw=0;renderPanel('album');
 }
 function arcWire(){
  arcCancel();drawer.classList.remove('arc-viewing');const wheel=content.querySelector('.arc-wheel');if(!wheel)return;
  arcDraw();requestAnimationFrame(()=>{if(selectedPanel==='album'&&!drawer.hidden)arcDraw();});
  wheel.addEventListener('pointerdown',e=>{
   if(e.button>0||arcDrag||arcReturning)return;
   cancelAnimationFrame(arcFrame);arcAnimating=false;
   const card=e.target.closest('[data-rad-card]'),hit=e.target.closest('[data-arc-slot],[data-rad-rotator]');
   arcDrag={id:e.pointerId,x:e.clientX,y:e.clientY,from:arcYaw,mode:null,kind:hit?'wheel':'page',slot:card?Number(card.dataset.radCard):0,lastX:e.clientX,lastT:performance.now(),velocity:0};
   try{wheel.setPointerCapture(e.pointerId);}catch(_){}
  });
  wheel.addEventListener('pointermove',e=>{
   const d=arcDrag;if(!d||e.pointerId!==d.id)return;
   const dx=e.clientX-d.x,dy=e.clientY-d.y;
   if(!d.mode&&Math.hypot(dx,dy)>8){
    if(Math.abs(dx)>Math.abs(dy)*1.15)d.mode=d.kind==='wheel'?'rotate':'page';
    else if(Math.abs(dy)>Math.abs(dx)*1.15)d.mode=d.slot&&dy<0?'lift':'ignore';
   }
   if(d.mode==='rotate'){
    const now=performance.now(),elapsed=Math.max(8,now-d.lastT);d.velocity=d.velocity*.4+((e.clientX-d.lastX)/elapsed)*.6;d.lastX=e.clientX;d.lastT=now;
    arcYaw=d.from+dx*arcTau/Math.max(310,wheel.clientWidth*1.20);arcDraw();e.preventDefault();
   }else if(d.mode==='lift'){
    arcLiftCard=d.slot;arcLift=Math.min(96,Math.max(0,-dy*.85));arcDraw();e.preventDefault();
   }else if(d.mode==='page')e.preventDefault();
  });
  const end=e=>{
   const d=arcDrag;if(!d||e.pointerId!==d.id)return;
   arcDrag=null;const dx=e.clientX-d.x,dy=e.clientY-d.y;
   if(e.type==='pointerup'){
    if(d.mode==='rotate'){
     const v=performance.now()-d.lastT<120?d.velocity:0;
     // No 45-degree snapping: free stop is necessary to see a card face.
     arcSettle(arcYaw+Math.max(-1.35,Math.min(1.35,v*.31)));return;
    }
    if(d.mode==='lift'&&dy< -38){arcShow(d.slot);return;}
    if(d.mode==='page'&&Math.abs(dx)>45){arcMovePage(dx<0?1:-1);return;}
   }
   arcLift=0;arcLiftCard=0;arcDraw();
  };
  for(const type of ['pointerup','pointercancel','lostpointercapture'])wheel.addEventListener(type,end);
  wheel.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();arcSettle(arcYaw+(e.key==='ArrowLeft'?arcStep:-arcStep));}
   if(e.key==='ArrowUp'||e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();const slot=e.target.closest('[data-rad-card]');if(slot)arcShow(Number(slot.dataset.radCard));}
  });
  for(const band of content.querySelectorAll('[data-arc-page-band]')){
   band.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;arcPageDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{band.setPointerCapture(e.pointerId)}catch(_){}});
   band.addEventListener('pointerup',e=>{if(!arcPageDrag||e.pointerId!==arcPageDrag.id)return;const dx=e.clientX-arcPageDrag.x,dy=e.clientY-arcPageDrag.y;arcPageDrag=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy))arcMovePage(dx<0?1:-1);});
   band.addEventListener('pointercancel',()=>arcPageDrag=null);
  }
  const viewer=content.querySelector('.arc-viewer');
  viewer?.addEventListener('click',e=>{if(arcReturning||performance.now()-arcFlipAt<350)return;if(e.target.closest('.arc-view-card')){arcFlip=!arcFlip;viewer.classList.toggle('arc-flipped',arcFlip);}else if(e.target===viewer)arcClose();});
  viewer?.addEventListener('pointerdown',e=>{if(e.target.closest('.arc-view-card')){arcPageDrag={id:e.pointerId,x:e.clientX,y:e.clientY};try{e.target.closest('.arc-view-card').setPointerCapture(e.pointerId)}catch(_){}}});
  viewer?.addEventListener('pointerup',e=>{
   if(arcPageDrag?.id!==e.pointerId)return;
   const dx=e.clientX-arcPageDrag.x,dy=e.clientY-arcPageDrag.y;arcPageDrag=null;
   if(dy>40&&Math.abs(dy)>Math.abs(dx)){arcFlipAt=performance.now();arcClose();}
   else if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)){arcFlipAt=performance.now();arcFlip=!arcFlip;viewer.classList.toggle('arc-flipped',arcFlip);}
  });
  viewer?.addEventListener('pointercancel',()=>arcPageDrag=null);
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
 if(arcQA){openPanel('album');const person=['haena','anika','amara'].indexOf(new URLSearchParams(location.search).get('person'));if(person>=0)window.__collectionTest.select(person);}
})();
