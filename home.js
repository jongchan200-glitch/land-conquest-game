/* Home lobby V0.2.8. The existing game world, rules, saves and shop remain authoritative.
   Layout/menu order deliberately mirrors hell-drop V0.7. */
(function(){
 'use strict';
 const home=document.getElementById('landHome'),drawer=document.getElementById('homeDrawer'),content=document.getElementById('homeDrawerBody'),title=document.getElementById('homeDrawerTitle');
 if(!home)return;
 const recordsKey='land-conquest-home-records-v1',previewKey='land-conquest-home-badge-preview-v1';
 let best=0,selectedPanel='',albumIndex=0;
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
  document.getElementById('homePlaySub').textContent=state.tiles||pct>15?'스테이지 '+state.stage+' · 이어서 탐험하기':'첫 번째 크래커 탐험 시작';
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
  refreshStats();
  if(window.home3D?.active){window.home3D.setBadge(localStorage.getItem(previewKey)==='1')}
 }
 function leaveHome(){
  drawer.hidden=true;selectedPanel='';home.hidden=true;window.__homeIsOpen=false;
  closePanel(); // resumes existing game; auto-new-world on zero hearts is old behavior
  updateHUD();
 }
 function previewBadge(){return localStorage.getItem(previewKey)==='1'}
 function openPanel(which){selectedPanel=which;drawer.hidden=false;renderPanel(which);document.getElementById('homeDrawerClose').focus({preventScroll:true})}
 function renderPanel(which=selectedPanel){
  if(!which)return;
  title.textContent=({character:'캐릭터',shop:'상점',earn:'코인',records:'기록',settings:'설정',album:'카드 수납장'})[which]||'메뉴';
  let html='';
  if(which==='character'){
   html=`<div class="banner"><strong>나만의 애벌레</strong><div>중앙 캐릭터를 직접 돌리면 앞·옆·뒷모습을 볼 수 있어.</div></div>
   <div class="small-stat"><div><small>현재 레벨</small><b>Lv.${state.level}</b></div><div><small>최대 몸 길이</small><b>${bodyMax()}</b></div></div>
   <h3>꾸미기 미리보기</h3><label class="toggle"><span>✦ 반짝 배지 (미리보기)<br><small>구매·장착 아이템이 아닌 시연 기능</small></span><input type="checkbox" id="homeBadgeSwitch" ${previewBadge()?'checked':''}></label>
   <button type="button" class="home-action" data-home-action="turn-left">↶ 왼쪽 회전</button><button type="button" class="home-action" data-home-action="turn-right">오른쪽 회전 ↷</button>
   <p class="notice">실제 게임의 확정 캐릭터 PNG는 변경하지 않았어. 중앙 3D 모델은 향후 스킨·배지 장착을 확인하기 위한 첫 입체 시제품이야.</p><button type="button" class="home-action" data-home-action="album">▣ 수집 카드 보기</button>`;
  }else if(which==='shop'){
   html=`<div class="banner">보유 <b style="color:#f8daa4">${num(state.coins)} 코인</b><br>현재 게임의 강화 상점을 그대로 사용해. 구매하면 실제 게임에 저장돼.</div>
   ${shopTile('capacity','포만 용량 +3','더 많은 크래커를 갉아먹어','⚗')}
   ${shopTile('speed','씹는 속도 향상','더 빠르게 크래커를 갉아먹어','↗')}
   ${shopTile('digest','소화 시간 감소','삼키는 정지 시간 단축','◷')}
   <p class="notice">실제 결제/광고는 아직 연결되지 않았어. 아이템·스킨 장착 상점은 이후 추가 예정이야.</p>`;
  }else if(which==='earn'){
   html=`<div class="banner"><strong>현재 보유 코인</strong><div style="font-size:30px;font-weight:900;color:#f7dc9f">🪙 ${num(state.coins)}</div></div>
   <div class="info-card"><b>게임 플레이로 코인 획득</b><br>영역을 점령하거나 몬스터를 포획하면 코인을 얻어. 스테이지 완료 시 보너스가 있어.</div>
   <div class="info-card"><b>광고 보상 · 준비 중</b><br>보상 광고, 코인 획득소, 실제 결제는 아직 미연동이야. 시청한 것처럼 코인을 지급하거나 결제하는 기능은 없어.</div>`;
  }else if(which==='records'){
   html=`<div class="small-stat"><div><small>최고 점령률</small><b>${best.toFixed(1)}%</b></div><div><small>몬스터 포획</small><b>${num(state.captures||0)}</b></div><div><small>현재 스테이지</small><b>${state.stage}</b></div><div><small>현재 레벨</small><b>${state.level}</b></div></div>
   <div class="info-card"><b>지금 점령한 영역</b><br>${capture().toFixed(1)}% / 목표 ${GOAL}%<br><small>최고 점령률은 이 기기에 기록돼.</small></div>
   <button type="button" class="home-action" data-home-action="album">▣ 수집 카드 열기</button>`;
  }else if(which==='settings'){
   html=`<div class="info-card"><b>화면 설정</b><br>게임 플레이는 기존 세로 전체화면을 유지해.</div>
   <button type="button" class="home-action" data-home-action="fullscreen">⛶ 전체 화면 전환</button>
   <div class="info-card"><b>조작</b><br>왼손 조이스틱으로 이동 · 오른손 버튼 한 번 누르면 앙 한 입 · 길게 누르면 연속 갉아먹기 · PC 방향키/WASD + Space</div>
   <div class="info-card"><b>저장</b><br>현재 휴대폰 브라우저에 자동 저장해. 기기 간 동기화와 온라인 계정은 아직 연결되지 않았어.</div>
   <p class="notice">홈 구성과 메뉴 항목은 지옥낙하 V0.7의 구조를 옮긴 것이고, 게임별 데이터·코인은 서로 별개야.</p>`;
  }else if(which==='album'){
   html=`<div class="banner">스테이지를 완주하면 사진 카드가 공개되고 수집돼.</div><div class="tabs"><button class="${albumIndex===0?'active':''}" data-home-action="album-haena">유해나</button><button class="${albumIndex===1?'active':''}" data-home-action="album-anika">아니카</button></div>${albumHTML(albumIndex)}`;
  }
  content.innerHTML=html;
 }
 function closeDrawer(){drawer.hidden=true;selectedPanel=''}
 home.addEventListener('click',e=>{const p=e.target.closest('[data-home-panel]');if(p){e.preventDefault();openPanel(p.dataset.homePanel)}});
 document.getElementById('homePlay').addEventListener('click',leaveHome);
 document.getElementById('homeDrawerClose').addEventListener('click',closeDrawer);
 drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer()});
 drawer.addEventListener('change',e=>{if(e.target.id==='homeBadgeSwitch'){
   try{localStorage.setItem(previewKey,e.target.checked?'1':'0')}catch(err){}
   window.home3D?.setBadge(e.target.checked)
 }});
 drawer.addEventListener('click',e=>{
  const b=e.target.closest('[data-home-action],[data-do]');if(!b)return;
  e.preventDefault();const action=b.dataset.homeAction||b.dataset.do;
  if(action.startsWith('buy-')){buy(action.slice(4));refreshStats();renderPanel('shop');return}
  if(action==='album'){albumIndex=0;openPanel('album');return}
  if(action==='album-haena'){albumIndex=0;renderPanel('album');return}
  if(action==='album-anika'){albumIndex=1;renderPanel('album');return}
  if(action==='turn-left'||action==='turn-right'){window.home3D?.setYaw(window.home3D.getYaw()+(action==='turn-left'?-1:1)*Math.PI/2);return}
  if(action==='fullscreen'){doAction('screen');return}
 });
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&window.__homeIsOpen&&!drawer.hidden){closeDrawer();e.preventDefault()}});
 window.__openLandHome=openHome;
 window.__refreshLandHomePanel=renderPanel;
 window.__refreshLandHomeStats=refreshStats;
 window.__landHomeTest={getOpen:()=>window.__homeIsOpen,panel:()=>selectedPanel,stats:()=>({best,level:state.level,coins:state.coins,badge:previewBadge(),modelActive:!!window.home3D?.active}),openPanel,enterGame:leaveHome,returnHome:openHome};
 openHome();
})();
