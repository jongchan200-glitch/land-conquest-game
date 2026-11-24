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
 function openPanel(which){selectedPanel=which;drawer.hidden=false;renderPanel(which);document.getElementById('homeDrawerClose').focus({preventScroll:true})}

 function collectionHTML(){
  const owned=totalOwned(),ch=roster[albumIndex],n=ownedCount(albumIndex),available=roster.slice(0,3);
  const previewTools='<div class="ww-preview-tools"><span>제작 시안 검수 · 소장 카드와 별도</span><button type="button" data-home-action="toggle-preview">'+(showPreview?'시안 숨기기':'시안 보기')+'</button></div>'+
     '<div class="ww-person-shortcuts">'+available.map((p,i)=>'<button type="button" data-home-action="collection-person-'+i+'" class="'+(i===albumIndex?'active':'')+'">'+String(i+1).padStart(2,'0')+' · '+p.name+'</button>').join('')+'</div>';
  const nav='<div class="collect-head"><div><span class="collect-kicker">THE PORTRAIT ARCHIVE</span><h3>나의 컬렉션 <em>'+owned+'<small> / 64</small></em></h3></div><div class="collect-orb">✦</div></div><div class="collect-progress"><span style="width:'+(owned/64*100)+'%"></span></div>'+previewTools;
  if(albumView==='detail'||albumView==='card'){
   const i=albumIndex;
   if(albumView==='card'){
    const has=ownedAt(i,selectedCard),gold=selectedCard===8;
    const artwork=canPreview(ch)?previewArt(ch,selectedCard):has&&ch.image&&selectedCard===1?'<img src="'+ch.image+'" alt="'+ch.name+' 카드">':'<div class="collect-empty-art">'+(has?'획득 완료 · 개별 사진 준비 중':'미획득 카드')+'</div>';
    return nav+'<button class="collect-back" data-home-action="collection-detail">‹ '+ch.name+' 카드첩</button>'+
       '<div class="collect-card-preview '+(gold?'gold':'')+' '+(canPreview(ch)?'ww-preview-card':'')+'">'+artwork+'<span>'+String(selectedCard).padStart(2,'0')+' / 08 · '+(canPreview(ch)?'제작 시안':has?'수집 완료':'미획득')+'</span></div>'+
       '<p class="collect-caption">'+(ch.topics?.[selectedCard-1]||'카드 이야기')+' · '+(has?'수집한 카드':'미획득 · 검수용 이미지')+'</p>'+
       (canPreview(ch)?'<p class="ww-preview-warning">'+ch.previewStatus+' · 미리보기는 실제 게임 보상을 지급하지 않아.</p>':'');
   }
   let slots='';
   for(let k=1;k<=8;k++){
    const got=ownedAt(i,k),gold=k===8,visual=canPreview(ch),image=visual?previewArt(ch,k):got&&ch.image&&k===1?'<img src="'+ch.image+'" alt="">':got?'✦':'◇';
    slots+='<button class="collect-slot '+(got?'filled':'locked')+' '+(gold?'gold':'')+' '+(visual?'ww-preview-slot':'')+'" data-home-action="collection-card-'+k+'" aria-label="'+ch.name+' '+k+'번 '+(got?'획득':'미획득')+'">'+
      '<span class="collect-slot-art">'+image+'</span><span class="collect-slot-id">'+String(k).padStart(2,'0')+(got?' · 보유':visual?' · 시안':gold?' · GOLD':' · 잠김')+'</span></button>';
   }
   const profile=Array.from({length:8},(_,j)=>{
     const got=ownedAt(i,j+1);
     return '<div class="collect-profile-line '+(got?'unlocked':'')+'"><span>'+String(j+1).padStart(2,'0')+'</span><span>'+(got||canPreview(ch)?(ch.topics?.[j]||'카드 이야기'):'??? · 카드 획득 시 공개')+'</span><small>'+(got?'수집':canPreview(ch)?'시안':'잠김')+'</small></div>';
   }).join('');
   return nav+'<button class="collect-back" data-home-action="collection-back">‹ 8명 컬렉션</button>'+
     '<div class="collect-person-bar"><strong>'+ch.name+'</strong><span>'+n+' / 8 실제 획득</span></div>'+
     '<div class="collect-slots">'+slots+'</div>'+
     (canPreview(ch)?'<p class="ww-preview-warning">'+ch.previewStatus+' · 제작 시안 8장을 모두 보여주는 검수 모드. 실제 수집 내역과 별도야.</p>':'')+
     '<h3 class="collect-section-title">한 장씩 열리는 이야기</h3><div class="collect-profile">'+profile+'</div>';
  }
  const indicators=roster.map((c,k)=>'<button class="collect-dot '+(k===albumIndex?'active':'')+'" data-home-action="collection-person-'+k+'" aria-label="'+(k+1)+'번째 인물">'+(k+1)+'</button>').join('');
  const portrait=canPreview(ch)?previewArt(ch,1):ch.image?'<img src="'+ch.image+'" alt="'+ch.name+' 대표 사진">':'<span class="collect-hidden-person">✧</span>';
  const gallery='<div class="collect-carousel"><button class="collect-arrow" data-home-action="collection-prev" aria-label="이전 인물">‹</button>'+
    '<button class="collect-hero '+(n?'unlocked':'missing')+'" data-home-action="collection-detail"><span class="collect-hero-img '+(canPreview(ch)?'ww-preview-hero':'')+'">'+portrait+'</span>'+
    '<span class="collect-hero-copy"><small>PORTRAIT '+String(albumIndex+1).padStart(2,'0')+' / 08</small><strong>'+ch.name+'</strong>'+
    '<span>실제 보유 '+n+'/8 · '+(canPreview(ch)?'8장 시안 확인 가능':pctCards(albumIndex)+'%')+'</span><i>카드첩 펼치기 ↗</i></span></button>'+
    '<button class="collect-arrow" data-home-action="collection-next" aria-label="다음 인물">›</button></div>';
  return nav+gallery+'<div class="collect-dots">'+indicators+'</div><p class="collect-caption">좌우로 넘겨 인물 선택 · 카드를 눌러 8장 시안을 확인해봐.</p>'+
    '<div class="collect-mini-roster">'+roster.map((c,k)=>'<button data-home-action="collection-person-'+k+'" class="'+(k===albumIndex?'active':'')+'">'+String(k+1).padStart(2,'0')+' · '+(k<3?c.name+' · ':'')+ownedCount(k)+'/8</button>').join('')+'</div>'+
    (canPreview(ch)?'<p class="ww-preview-warning">'+ch.previewStatus+' · 미리보기 사진은 확정된 최종 카드가 아니야.</p>':'');
 }
 function renderPanel(which=selectedPanel){
  if(!which)return;
  title.textContent=({character:'캐릭터',shop:'상점',expedition:'탐험',settings:'설정',album:'컬렉션'})[which]||'메뉴';
  let html='';
  if(which==='character'){
   html=`<div class="banner"><strong>나만의 애벌레</strong><div>중앙 캐릭터를 직접 돌리면 앞·옆·뒷모습을 볼 수 있어.</div></div>
   <div class="small-stat"><div><small>현재 레벨</small><b>Lv.${state.level}</b></div><div><small>최대 몸 길이</small><b>${bodyMax()}</b></div></div>
   <h3>영구 보유 · 캐릭터 스킨</h3><div class="skin-grid">${[{id:'peach',label:'기본 복숭아',price:0,color:'#f6c59e'},{id:'mint',label:'민트 꼬물이',price:120,color:'#91cfba'},{id:'coral',label:'핑크 산호',price:180,color:'#f2a1b3'},{id:'gold',label:'황금 꼬물이',price:400,color:'#dfbd76'}].map(x=>`<button class="skin-pick ${state.skins?.equipped===x.id?'chosen':''}" data-home-action="skin-${x.id}"><i style="background:${x.color}"></i><span>${x.label}</span><small>${state.skins?.owned?.includes(x.id)?(state.skins?.equipped===x.id?'장착 중':'장착하기'):x.price+' 코인'}</small></button>`).join('')}</div>
   <h3>꾸미기 미리보기</h3><label class="toggle"><span>✦ 반짝 배지 (미리보기)<br><small>구매·장착 아이템이 아닌 시연 기능</small></span><input type="checkbox" id="homeBadgeSwitch" ${previewBadge()?'checked':''}></label>
   <button type="button" class="home-action" data-home-action="turn-left">↶ 왼쪽 회전</button><button type="button" class="home-action" data-home-action="turn-right">오른쪽 회전 ↷</button>
   <p class="notice">실제 게임의 확정 캐릭터 PNG는 변경하지 않았어. 중앙 3D 모델은 향후 스킨·배지 장착을 확인하기 위한 첫 입체 시제품이야.</p><button type="button" class="home-action" data-home-action="album">▣ 수집 카드 보기</button>`;
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
   html=`<div class="info-card"><b>화면 설정</b><br>게임 플레이는 기존 세로 전체화면을 유지해.</div>
   <button type="button" class="home-action" data-home-action="fullscreen">⛶ 전체 화면 전환</button>
   <button type="button" class="home-action" data-home-action="toggle-minimap">▦ 미니맵 ${miniOn?'끄기':'켜기'}</button>
   <div class="info-card"><b>조작</b><br>왼손 조이스틱으로 이동 · 오른손 버튼 한 번 누르면 앙 한 입 · 길게 누르면 연속 갉아먹기 · PC 방향키/WASD + Space</div>
   <div class="info-card"><b>장기 탐험 저장</b><br>5초마다 자동 저장해. 하트를 모두 잃으면 이번 구역의 점령 진행은 끝나지만, 코인과 수집 카드는 남아. 기기/브라우저별 로컬 저장이므로 데이터를 지우면 복원되지 않을 수 있어.<br><button type="button" class="home-action" data-home-action="save-export">↓ 진행 데이터 백업</button><label class="home-action" style="display:inline-block;cursor:pointer">↑ 백업 파일 불러오기<input id="homeSaveImport" type="file" accept=".json,application/json" style="display:none"></label></div>
   <p class="notice">와구와구 · 모든 언어에서 하나의 앱으로 즐길 수 있어. 광고 기능은 실제 앱 출시 전 연결 예정.</p>`;
  }else if(which==='album'){
   html=collectionHTML();
  }
  if(which==='settings')html=window.wwSettingsMarkup?.()+html;
  content.innerHTML=html;window.wwTranslate?.(drawer);
 }
 function closeDrawer(){drawer.hidden=true;selectedPanel='';if(window.__homeIsOpen)window.wwBgm?.pause()}
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
  if(action.startsWith('buy-')){buy(action.slice(4));refreshStats();renderPanel('shop');return}
  if(action==='album'){albumIndex=0;albumView='roster';openPanel('album');return}
  if(action==='toggle-preview'){showPreview=!showPreview;renderPanel('album');return;}
  if(action==='collection-next'||action==='collection-prev'){albumIndex=(albumIndex+(action==='collection-next'?1:7))%8;albumView='roster';renderPanel('album');return}
  if(action.startsWith('collection-person-')){albumIndex=Math.max(0,Math.min(7,Number(action.slice(18))||0));albumView='roster';renderPanel('album');return}
  if(action==='collection-detail'){albumView='detail';renderPanel('album');return}
  if(action==='collection-back'){albumView='roster';renderPanel('album');return}
  if(action.startsWith('collection-card-')){selectedCard=Math.max(1,Math.min(8,Number(action.slice(16))||1));albumView='card';renderPanel('album');return}
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
 let collectionTouchX=null;
 content.addEventListener('touchstart',e=>{if(!e.target.closest('.collect-carousel'))return;collectionTouchX=e.touches[0]?.clientX||null},{passive:true});
 content.addEventListener('touchend',e=>{if(collectionTouchX===null)return;const delta=(e.changedTouches[0]?.clientX||collectionTouchX)-collectionTouchX;collectionTouchX=null;if(Math.abs(delta)>45&&selectedPanel==='album'&&albumView==='roster'){albumIndex=(albumIndex+(delta<0?1:7))%8;renderPanel('album')}},{passive:true});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&window.__homeIsOpen&&!drawer.hidden){closeDrawer();e.preventDefault()}});
 window.__openLandHome=openHome;
 window.__refreshLandHomePanel=renderPanel;
 window.__refreshLandHomeStats=refreshStats;
 window.__collectionTest={rosterCount:()=>roster.length,owned:totalOwned,open:()=>{albumView='roster';openPanel('album')},select:(i)=>{albumIndex=i;albumView='detail';renderPanel('album')}};
 window.__landHomeTest={getOpen:()=>window.__homeIsOpen,panel:()=>selectedPanel,stats:()=>({best,level:state.level,coins:state.coins,badge:previewBadge(),modelActive:!!window.home3D?.active}),openPanel,enterGame:leaveHome,returnHome:openHome};
 openHome();
})();
