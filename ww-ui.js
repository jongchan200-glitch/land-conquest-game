/* WAGEUJAK WAGEUJAK — HUD, app-local preferences & localization.
   Play Store design: no bundled SDK/remote dependency; native bridge can replace BGM/ads later. */
(function(){
'use strict';
const STORE='wagjak-ui-preferences-v1';
let prefs={language:'auto',bgm:15,sfx:70};
try{prefs={...prefs,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){}
const accepted=['auto','ko','en','es','ja','pt-BR'];
function locale(){
 if(prefs.language!=='auto'&&accepted.includes(prefs.language))return prefs.language;
 const raw=(navigator.languages?.[0]||navigator.language||'ko').toLowerCase();
 if(raw.startsWith('ko'))return 'ko';if(raw.startsWith('es'))return 'es';if(raw.startsWith('ja'))return 'ja';if(raw.startsWith('pt'))return 'pt-BR';return 'en';
}
const translations={
 '캐릭터':['Character','Personaje','キャラクター','Personagem'],
 '상점':['Shop','Tienda','ショップ','Loja'],
 '컬렉션':['Collection','Colección','コレクション','Coleção'],
 '탐험':['Explore','Explorar','冒険','Explorar'],
 '설정':['Settings','Ajustes','設定','Configurações'],
 '탐험 시작':['Start Adventure','Empezar aventura','冒険を始める','Iniciar aventura'],
 '이어서 탐험':['Continue Adventure','Continuar aventura','冒険を続ける','Continuar aventura'],
 '레벨':['Level','Nivel','レベル','Nível'],
 '코인':['Coins','Monedas','コイン','Moedas'],
 '저장·종료':['Save & Exit','Guardar y salir','保存して終了','Salvar e sair'],
 '저장 후 종료':['Save & Exit','Guardar y salir','保存して終了','Salvar e sair'],
 '일시정지':['Paused','En pausa','一時停止','Pausado'],
 '계속 플레이':['Resume','Continuar','再開','Continuar'],
 '홈 화면':['Home','Inicio','ホーム','Início'],
 '처음부터 다시 시작':['Start Over','Empezar de nuevo','最初からやり直す','Recomeçar'],
 '다시 도전':['Try Again','Reintentar','もう一度','Tentar novamente'],
 '광고 보고 이어하기':['Watch Ad to Continue','Ver anuncio para seguir','広告を見て続ける','Assistir anúncio para continuar'],
 '광고 연동 준비 중':['Rewarded ad coming soon','Anuncio disponible pronto','報酬広告は準備中','Anúncio em preparação'],
 '게임 오버':['Game Over','Fin de partida','ゲームオーバー','Fim de jogo'],
 '모든 하트를 잃었어요!':['No hearts left!','¡No quedan corazones!','ハートがなくなりました！','Sem corações!'],
 '광고를 보고 현재 영역에서 계속하거나 처음부터 새로 도전할 수 있어요.':['Watch an ad to keep your territory, or start a new run.','Mira un anuncio para conservar tu zona o comienza de nuevo.','広告で領地を保って続行、または最初から挑戦できます。','Veja um anúncio para manter seu território ou recomece.'],
 '광고를 보지 않아도 새로운 게임은 언제나 시작할 수 있어요.':['You can always start a new game without watching an ad.','Siempre puedes jugar de nuevo sin ver un anuncio.','広告なしで新しいゲームを始められます。','Você pode recomeçar sem assistir anúncios.'],
 '현재 구역의 점령 기록은 초기화됩니다. 코인과 수집 카드는 유지돼요.':['The current zone resets. Coins and cards are kept.','La zona actual se reinicia. Se conservan monedas y cartas.','現在のエリアはリセット。コインとカードは保持されます。','A zona atual será reiniciada. Moedas e cartas são mantidas.'],
 '나만의 애벌레':['My Caterpillar','Mi oruga','マイいもむし','Minha lagarta'],
 '최대 몸 길이':['Max Body Length','Longitud máxima','最大体長','Comprimento máximo'],
 '영구 보유 · 캐릭터 스킨':['Permanent Skins','Aspectos permanentes','永久スキン','Visuais permanentes'],
 '꾸미기 미리보기':['Appearance Preview','Vista previa','見た目のプレビュー','Prévia visual'],
 '기본 복숭아':['Peach','Melocotón','ピーチ','Pêssego'],
 '민트 꼬물이':['Mint','Menta','ミント','Menta'],
 '핑크 산호':['Coral','Coral','コーラル','Coral'],
 '황금 꼬물이':['Golden','Dorado','ゴールド','Dourado'],
 '장착 중':['Equipped','Equipado','装備中','Equipado'],
 '장착하기':['Equip','Equipar','装備','Equipar'],
 '반짝 배지 (미리보기)':['Shiny Badge (Preview)','Insignia brillante (vista previa)','きらきらバッジ（試作）','Emblema brilhante (prévia)'],
 '구매·장착 아이템이 아닌 시연 기능':['Preview only, not a purchased item','Solo vista previa','試作表示のみ','Apenas demonstração'],
 '왼쪽 회전':['Turn Left','Girar a la izquierda','左に回す','Girar à esquerda'],
 '오른쪽 회전':['Turn Right','Girar a la derecha','右に回す','Girar à direita'],
 '수집 카드 보기':['View Cards','Ver cartas','カードを見る','Ver cartas'],
 '탐험 상점':['Adventure Shop','Tienda de aventuras','冒険ショップ','Loja de aventura'],
 '이번 맵 성장 강화':['Map Upgrades','Mejoras del mapa','マップ強化','Melhorias do mapa'],
 '코인 모으기':['Earn Coins','Conseguir monedas','コインを集める','Ganhar moedas'],
 '포만 용량 +3':['Capacity +3','Capacidad +3','容量 +3','Capacidade +3'],
 '씹는 속도':['Chew Speed','Velocidad de mordida','かじる速度','Velocidade de mastigação'],
 '소화 시간 감소':['Faster Digestion','Digestión rápida','消化時間短縮','Digestão rápida'],
 '먹는 폭 강화':['Wider Bite','Mordisco más ancho','かじる幅アップ','Mordida mais ampla'],
 '이동 속도':['Move Speed','Velocidad de movimiento','移動速度','Velocidade de movimento'],
 '오늘의 탐험 선물 · +30 코인':['Daily Gift · +30 Coins','Regalo diario · +30 monedas','デイリーギフト · +30 コイン','Presente diário · +30 moedas'],
 '하루 1회 무료로 받을 수 있어.':['Free once per day.','Gratis una vez al día.','1日1回無料でもらえます。','Grátis uma vez por dia.'],
 '오늘 수령 완료':['Claimed Today','Recibido hoy','本日受取済み','Resgatado hoje'],
 '무료 30코인 받기':['Claim 30 Coins','Recibir 30 monedas','無料で30コイン','Receber 30 moedas'],
 '짧은 보상 광고 · 연동 예정':['Rewarded Ad · Coming Soon','Anuncio con recompensa · Pronto','報酬広告 · 準備中','Anúncio recompensado · Em breve'],
 '광고 완료 시에만 게임 코인을 지급할 예정이야. 현재는 광고 송출·보상이 연결되지 않았어.':['Coins will be awarded only after a verified ad. Ads are not yet connected.','Las monedas se darán tras confirmar el anuncio. Aún no hay anuncios.','広告視聴完了を確認後にコインを付与。広告は未接続です。','Moedas só após anúncio validado. Anúncios ainda não conectados.'],
 '최고 점령률':['Best Capture','Mejor conquista','最高占領率','Melhor conquista'],
 '몬스터 포획':['Monsters Caught','Monstruos capturados','捕獲モンスター','Monstros capturados'],
 '현재 스테이지':['Current Stage','Etapa actual','現在のステージ','Fase atual'],
 '현재 레벨':['Current Level','Nivel actual','現在のレベル','Nível atual'],
 '지금 점령한 영역':['Current Territory','Territorio actual','現在の領地','Território atual'],
 '수집 카드 열기':['Open Collection','Abrir colección','コレクションを開く','Abrir coleção'],
 '화면 설정':['Display','Pantalla','画面設定','Tela'],
 '전체 화면 전환':['Toggle Fullscreen','Pantalla completa','全画面切り替え','Tela cheia'],
 '조작':['Controls','Controles','操作','Controles'],
 '장기 탐험 저장':['Save Progress','Guardar progreso','進行状況の保存','Salvar progresso'],
 '진행 데이터 백업':['Export Save','Exportar partida','セーブを保存','Exportar progresso'],
 '백업 파일 불러오기':['Import Save','Importar partida','セーブを読み込む','Importar progresso'],
 '언어 설정':['Language','Idioma','言語','Idioma'],
 '휴대폰 언어 자동':['Auto (Phone Language)','Auto (idioma del móvil)','自動（端末の言語）','Automático (celular)'],
 '배경음악':['Music','Música','BGM','Música'],
 '효과음':['Sound Effects','Efectos de sonido','効果音','Efeitos sonoros'],
 '나의 컬렉션':['My Collection','Mi colección','マイコレクション','Minha coleção'],
 '한 장씩 열리는 이야기':['Stories to Unlock','Historias por desbloquear','解放される物語','Histórias para desbloquear'],
 '미획득 카드':['Locked Card','Carta sin obtener','未獲得カード','Carta bloqueada'],
 '카드첩 펼치기':['Open Card Album','Abrir álbum','カードアルバムを開く','Abrir álbum de cartas'],
 '첫 번째 애벌레':['First Caterpillar','Primera oruga','最初のいもむし','Primeira lagarta'],
 '애벌레':['Caterpillar','Oruga','いもむし','Lagarta'],
 '게임 시작':['Start Game','Empezar','ゲーム開始','Começar'],
 '탐험 계속하기':['Continue','Continuar','続ける','Continuar'],
 '탐험 기록':['Adventure Records','Registro','冒険の記録','Registros'],
 '저장하고 홈으로':['Save & Home','Guardar e ir al inicio','保存してホームへ','Salvar e voltar'],
 '위험':['Danger','Peligro','危険','Perigo'],
 '입안의 여유':['Bite Capacity','Capacidad de mordida','かじれる量','Capacidade de mordida'],
 '몸 길이':['Body Length','Longitud del cuerpo','体の長さ','Comprimento do corpo']
};
const langIndex={en:0,es:1,ja:2,'pt-BR':3};
const originals=new WeakMap();
function translate(root){
 const language=locale();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.parentElement?.closest('script,style,svg,#wwHud,.home-title'))continue;
  const current=node.nodeValue;
  if(!current.trim())continue;
  const original=originals.has(node)?originals.get(node):current;
  originals.set(node,original);
  const leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0],key=original.trim();
  const value=language==='ko'?key:translations[key]?.[langIndex[language]];
  if(value&&node.nodeValue!==leading+value+trailing)node.nodeValue=leading+value+trailing;
  if(language==='ko'&&node.nodeValue!==original)node.nodeValue=original;
 }
}
function keep(){try{localStorage.setItem(STORE,JSON.stringify(prefs))}catch(e){}}
const languageOptions=[
 ['auto','🌐 · Auto / 휴대폰 언어'],['ko','한국어'],['en','English'],['es','Español'],['ja','日本語'],['pt-BR','Português (Brasil)']
];
function apply(){
 const language=locale(),t=(k)=>language==='ko'?k:(translations[k]?.[langIndex[language]]||k);
 document.documentElement.lang=language;
 const nav=document.querySelectorAll('.home-nav button span:last-child');
 nav.forEach(el=>{if(!el.dataset.wwKo)el.dataset.wwKo=el.textContent;el.textContent=t(el.dataset.wwKo)});
 const play=document.querySelector('.home-play-copy strong');
 if(play)play.textContent=t('탐험 시작');
 const sub=document.getElementById('homePlaySub');
 if(sub)sub.textContent=t((typeof state!=='undefined'&&(state?.tiles||capture?.()>15))?'이어서 탐험':'탐험 시작');
 const tip=document.querySelector('.home-drag-tip');
 if(tip)tip.textContent={ko:'↔ 손가락으로 좌우 회전',en:'↔ Drag to rotate left and right',es:'↔ Desliza para girar',ja:'↔ 左右に動かして回転','pt-BR':'↔ Arraste para girar'}[language];
 const identity=document.querySelector('.home-identity b');if(identity)identity.textContent=t('애벌레');
 const desc=document.querySelector('.home-identity span');if(desc)desc.textContent=t('첫 번째 애벌레');
 const drawer=document.getElementById('homeDrawer');
 if(drawer&&!drawer.hidden)translate(drawer);
 const sheet=document.getElementById('sheet');if(sheet)translate(sheet);
}
function setLanguage(v){if(!accepted.includes(v))return; prefs.language=v;keep();apply();}
function volume(field,value){prefs[field]=Math.max(0,Math.min(100,Math.round(Number(value)||0)));keep();if(field==='bgm')window.wwBgm?.setVolume(prefs.bgm);}
function settingsMarkup(){const t=k=>locale()==='ko'?k:translations[k]?.[langIndex[locale()]]||k;
 return '<div class="ww-language-row"><label for="wwLanguage">'+t('언어 설정')+' / Language</label><select id="wwLanguage">'+languageOptions.map(([v,label])=>'<option value="'+v+'" '+(prefs.language===v?'selected':'')+'>'+label+'</option>').join('')+'</select></div>'+
 '<div class="ww-language-row"><label>'+t('배경음악')+' / BGM</label><div class="ww-volume"><input id="wwBgmVolume" type="range" min="0" max="100" step="1" value="'+prefs.bgm+'"><output id="wwBgmOutput">'+prefs.bgm+'</output></div>'+
 '<label>'+t('효과음')+' / SFX</label><div class="ww-volume"><input id="wwSfxVolume" type="range" min="0" max="100" step="1" value="'+prefs.sfx+'"><output id="wwSfxOutput">'+prefs.sfx+'</output></div></div>';
}
window.wwPrefs=prefs;window.wwLocale=locale;window.wwApplyLanguage=apply;window.wwTranslate=translate;window.wwSetLanguage=setLanguage;window.wwSetVolume=volume;window.wwSettingsMarkup=settingsMarkup;
window.wwT=(key)=>locale()==='ko'?key:(translations[key]?.[langIndex[locale()]]||key);
// Sound adapter: MP3 assets are deliberately not faked. Drop in licensed, approved audio later.
let soundtrack=null,trackIndex=0;
const tracks=['./assets/bgm/moonlight.mp3','./assets/bgm/turkish-march.mp3','./assets/bgm/vivaldi-winter.mp3','./assets/bgm/pathetique.mp3'];
const bgm={
 available:false,playing:false,
 setVolume(v){if(soundtrack)soundtrack.volume=Math.max(0,Math.min(1,v/100));},
 async play(){
   if(!this.available||prefs.bgm<=0)return;
   try{
    if(!soundtrack){soundtrack=new Audio();soundtrack.preload='none';soundtrack.addEventListener('ended',()=>{trackIndex=(trackIndex+1)%tracks.length;bgm.next()});}
    if(!soundtrack.src){trackIndex=Math.floor(Math.random()*tracks.length);soundtrack.src=tracks[trackIndex]}
    soundtrack.volume=prefs.bgm/100;await soundtrack.play();this.playing=true;
   }catch(e){this.playing=false;}
 },
 next(){if(!this.available)return;trackIndex=(trackIndex+1)%tracks.length;if(soundtrack){soundtrack.src=tracks[trackIndex];this.play();}},
 pause(){if(soundtrack)soundtrack.pause();this.playing=false;}
};
window.wwBgm=bgm;
// HUD: preserve original element IDs and events. Move the existing save button, never duplicate it.
const app=document.getElementById('app'),saveBtn=document.getElementById('saveBtn');
if(app&&saveBtn){
 const hud=document.createElement('div');hud.id='wwHud';hud.setAttribute('aria-label','게임 정보');
 hud.innerHTML='<div class="ww-knot" id="wwLevel" aria-label="레벨"><small>Lv.</small><strong id="wwLevelValue">1</strong></div>'+
 '<div class="ww-center"><div class="ww-capture"><strong id="wwCapture">0%</strong><small id="wwZone">1/6</small></div><div class="ww-bites" id="wwBites"></div><div class="ww-stretch" aria-label="몸 길이"><i id="wwStretch"></i></div></div>'+
 '<div class="ww-side"><div class="ww-hearts" id="wwHearts"><span>♥</span><span>♥</span><span>♥</span></div><div class="ww-coin"><span class="ww-gold">✦</span><strong id="wwCoins">0</strong></div><div class="ww-side-footer" id="wwSideFooter"><button id="wwPauseBtn" aria-label="일시정지" title="일시정지">Ⅱ</button></div></div>';
 app.appendChild(hud);
 saveBtn.textContent='⌂ 저장';saveBtn.title='저장 후 종료';saveBtn.setAttribute('aria-label','저장 후 홈으로 돌아가기');
 hud.querySelector('#wwSideFooter').prepend(saveBtn);
 hud.querySelector('#wwPauseBtn').addEventListener('click',()=>{if(typeof showPanel==='function'&&!window.__homeIsOpen)showPanel('menu')});
 window.wwUpdateHud=function(){
  if(typeof state==='undefined'||!state)return;
  document.getElementById('wwLevelValue').textContent=state.level;
  const xpMax=typeof xpLimit==='function'?xpLimit(state.level):100;
  document.getElementById('wwLevel').style.setProperty('--xp',Math.min(100,Math.max(0,state.xp/xpMax*100))+'%');
  document.getElementById('wwCapture').textContent=(typeof capture==='function'?capture():0).toFixed(1)+'%';
  document.getElementById('wwZone').textContent=(state.unlockedZone||1)+'/6';
  document.getElementById('wwCoins').textContent=Number(state.coins||0).toLocaleString('ko-KR');
  [...document.querySelectorAll('#wwHearts span')].forEach((heart,i)=>heart.classList.toggle('empty',i>=state.hearts));
  const total=typeof biteMax==='function'?Math.min(24,biteMax()):8;
  const used=Math.floor(Number(state.fullness)||0);const box=document.getElementById('wwBites');
  if(box.childElementCount!==total)box.innerHTML=Array.from({length:total},()=>'<i></i>').join('');
  [...box.children].forEach((s,i)=>s.classList.toggle('filled',i<total-used));
  const progress=(typeof bodyTotal==='number'&&typeof bodyMax==='function')?Math.min(100,bodyTotal/bodyMax()*100):0;
  const stretch=document.getElementById('wwStretch');stretch.style.width=progress.toFixed(1)+'%';stretch.classList.toggle('danger',progress>83);
 };
 try{window.wwUpdateHud()}catch(e){}
}
const title=document.querySelector('.home-title');
if(title){const h=title.querySelector('h1'),sub=title.querySelector('p');if(h)h.innerHTML='<span>와그작</span> <span>와그작</span>';if(sub)sub.textContent='WAGEUJAK WAGEUJAK';const kicker=title.querySelector('.home-kicker');if(kicker)kicker.textContent='WAGJAK · WAGJAK';}
const showcase=document.getElementById('homeShowcase');
if(showcase){
 for(const [side,label] of [['prev','이전 캐릭터'],['next','다음 캐릭터']]){
  const b=document.createElement('button');b.type='button';b.hidden=true;b.className='home-char-nav '+side;b.textContent=side==='prev'?'‹':'›';b.setAttribute('aria-label',label);showcase.appendChild(b);
 }
}
window.wwRenderCharacterNav=()=>{const list=typeof state!=='undefined'&&Array.isArray(state?.characters?.owned)?state.characters.owned:['peach'];
 const ready=list.length>1&&window.home3D?.setCharacter;
 for(const b of document.querySelectorAll('.home-char-nav'))b.hidden=!ready;
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)bgm.pause();});
window.addEventListener('pointerdown',()=>{if(!window.__homeIsOpen)bgm.play()},{passive:true});
apply();
})();
