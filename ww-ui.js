/* WAGU WAGU — HUD, app-local preferences & localization.
   Play Store design: no bundled SDK/remote dependency; native bridge can replace BGM/ads later. */
(function(){
'use strict';
const STORE='wagjak-ui-preferences-v1';
let prefs={language:'auto',bgm:35,sfx:75};
try{prefs={...prefs,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){}
const accepted=['auto','ko','en','es','ja','pt-BR'];
function locale(){
 if(prefs.language!=='auto'&&accepted.includes(prefs.language))return prefs.language;
 const raw=(navigator.languages?.[0]||navigator.language||'ko').toLowerCase();
 if(raw.startsWith('ko'))return 'ko';if(raw.startsWith('es'))return 'es';if(raw.startsWith('ja'))return 'ja';if(raw.startsWith('pt'))return 'pt-BR';return 'en';
}
const translations={
 '미니맵 켜기':['Show Minimap','Mostrar minimapa','ミニマップを表示','Mostrar minimapa'],
 '미니맵 끄기':['Hide Minimap','Ocultar minimapa','ミニマップを隠す','Ocultar minimapa'],
 '전체 화면 전환':['Fullscreen','Pantalla completa','全画面表示','Tela cheia'],
 '저장하고 홈으로':['Save & Home','Guardar e ir al inicio','保存してホームへ','Salvar e sair'],
 '▶ 광고 보고 이어하기 · 준비 중':['▶ Watch Ad · Coming Soon','▶ Ver anuncio · Pronto','▶ 広告で続ける · 準備中','▶ Assistir anúncio · Em breve'],
 '첫 번째 크래커 탐험 시작':['Start First Adventure','Comenzar aventura','最初の冒険を始める','Iniciar primeira aventura'],
 '이번 판에서 새로운 땅을 탐험해보자!':['Explore a new territory!','¡Explora un nuevo territorio!','新しい領地を探索しよう！','Explore um novo território!'],
 '게임 플레이는 기존 세로 전체화면을 유지해.':['The game uses a portrait full-screen layout.','El juego usa pantalla completa vertical.','ゲームは縦向き全画面で遊びます。','O jogo usa a tela vertical inteira.'],
 '왼손 조이스틱으로 이동 · 오른손 버튼 한 번 누르면 앙 한 입 · 길게 누르면 연속 갉아먹기 · PC 방향키/WASD + Space':['Left joystick to move · Tap right button to bite · Hold to chew continuously · PC: WASD + Space','Joystick izquierdo para mover · Pulsa para morder · Mantén para seguir · PC: WASD + Espacio','左スティックで移動・右ボタンでかじる・長押しで連続・PC: WASD + Space','Joystick esquerdo move · Toque para morder · Segure para mastigar · PC: WASD + Espaço'],
 '5초마다 자동 저장해. 하트를 모두 잃으면 이번 구역의 점령 진행은 끝나지만, 코인과 수집 카드는 남아. 기기/브라우저별 로컬 저장이므로 데이터를 지우면 복원되지 않을 수 있어.':['Auto-save every 5 seconds. Losing all hearts ends the run, but coins and cards remain. Saves are stored on this device.','Guardado cada 5 segundos. Perder todos los corazones termina la partida, pero conservas monedas y cartas. Datos locales.','5秒ごとに自動保存。ハートがなくなると挑戦終了。コインとカードは保持。保存は端末内です。','Salvo a cada 5 segundos. Sem corações, a partida termina; moedas e cartas ficam. Dados locais.'],
 '실제 결제와 광고는 작동하지 않아. 스킨은 구매 시 모든 맵에서 유지하는 별도 꾸미기 메뉴로 운영할 예정이야.':['Real payments and ads are not connected yet. Purchased skins remain across maps.','Los pagos y anuncios reales aún no están disponibles. Los aspectos se conservan.','実際の広告・課金はまだ未接続。購入したスキンは保持されます。','Pagamentos e anúncios reais ainda indisponíveis. Visuais adquiridos são mantidos.'],
 '최고 점령률은 이 기기에 기록돼.':['Your best capture is saved on this device.','El récord se guarda en este dispositivo.','最高記録はこの端末に保存されます。','Seu recorde fica neste dispositivo.'],
 '미획득 카드':['Locked Card','Carta bloqueada','未獲得カード','Carta não obtida'],
 '카드 획득 시 공개':['Revealed when collected','Se muestra al obtenerla','獲得時に公開','Revelado ao obter'],
 '카드첩 펼치기':['Open Card Album','Abrir álbum','カード帳を開く','Abrir álbum de cartas'],
 '스킨':['Skin','Aspecto','スキン','Visual'],
 '코인 상점':['Coin Shop','Tienda de monedas','コインショップ','Loja de moedas'],
 '꿀꺽':['Gulp','Glup','ごくん','Glup'],
 '다음 카드 맵':['Next Map','Siguiente mapa','次のマップ','Próximo mapa'],
 '컬렉션에 넣기':['Add to Collection','Añadir a colección','コレクションに追加','Adicionar à coleção'],
 '✦ 컬렉션에 넣기':['✦ Add to Collection','✦ Añadir a colección','✦ コレクションに追加','✦ Adicionar à coleção'],
 '현재 위치 저장 완료':['Progress Saved','Progreso guardado','保存完了','Progresso salvo'],
 '처음부터 다시 시작':['Start Fresh','Empezar desde cero','最初からやり直す','Recomeçar do início'],
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
 '광고 보고 이어하기 · 준비 중':['Watch Ad to Continue · Coming Soon','Ver anuncio para continuar · Pronto','広告で続ける · 準備中','Assistir anúncio · Em breve'],
 '상점·컬렉션·설정은 홈에서 이용할 수 있어.':['Shop, collection and settings are available on the home screen.','Tienda, colección y ajustes están en el inicio.','ショップ・コレクション・設定はホームから。','Loja, coleção e configurações ficam na tela inicial.'],
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
function volume(field,value){
 if(field!=='bgm'&&field!=='sfx')return;
 prefs[field]=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
 keep();
 if(field==='bgm')window.wwBgm?.setVolume(prefs.bgm);
}
function settingsMarkup(){
 const t=k=>locale()==='ko'?k:translations[k]?.[langIndex[locale()]]||k;
 return '<div class="ww-language-row"><label for="wwLanguage">'+t('언어 설정')+' / Language</label><select id="wwLanguage">'+languageOptions.map(([v,label])=>'<option value="'+v+'" '+(prefs.language===v?'selected':'')+'>'+label+'</option>').join('')+'</select></div>'+
 '<div class="ww-language-row"><label for="wwBgmVolume">'+t('배경음악')+' / BGM</label><div class="ww-volume"><input id="wwBgmVolume" type="range" min="0" max="100" step="1" value="'+prefs.bgm+'"><output id="wwBgmOutput">'+prefs.bgm+'</output></div>'+
 '<button class="home-action" type="button" data-ww-audio-test="bgm">▶ 음악 미리듣기</button>'+
 '<label for="wwSfxVolume">'+t('효과음')+' / SFX</label><div class="ww-volume"><input id="wwSfxVolume" type="range" min="0" max="100" step="1" value="'+prefs.sfx+'"><output id="wwSfxOutput">'+prefs.sfx+'</output></div>'+
 '<button class="home-action" type="button" data-ww-audio-test="sfx">▶ 효과음 미리듣기</button>'+
 '<small id="wwAudioHint" aria-live="polite">음량은 0~100으로 따로 저장돼. 음악을 들어보면서 조절할 수 있어.</small></div>';
}
window.wwPrefs=prefs;window.wwLocale=locale;window.wwApplyLanguage=apply;window.wwTranslate=translate;window.wwSetLanguage=setLanguage;window.wwSetVolume=volume;window.wwSettingsMarkup=settingsMarkup;
window.wwT=(key)=>locale()==='ko'?key:(translations[key]?.[langIndex[locale()]]||key);
// Approved original 4-track ZIP. Stored as one licensed asset to avoid proxy links.
// Modern Android WebView supports the native deflate-raw stream used by ZIP.
const archive='./assets/bgm/wagjak-approved-4tracks.zip';
let soundtrack=null,trackIndex=0,tracks=[],loading=null;
let shuffled=[],playing=false;
function read32(d,o){return(d[o]|d[o+1]<<8|d[o+2]<<16|d[o+3]<<24)>>>0}
function read16(d,o){return d[o]|d[o+1]<<8}
async function loadBgm(){
 if(tracks.length)return tracks;
 if(loading)return loading;
 loading=(async()=>{
  if(typeof DecompressionStream!=='function')throw Error('ZIP deflate not supported');
  const response=await fetch(archive,{cache:'force-cache'});
  if(!response.ok)throw Error('BGM ZIP HTTP '+response.status);
  const bytes=new Uint8Array(await response.arrayBuffer()),objects=[];
  let off=0,guard=0;
  while(off+30<=bytes.length&&read32(bytes,off)===0x04034b50&&guard++<40){
   const method=read16(bytes,off+8),packed=read32(bytes,off+18);
   const nameSize=read16(bytes,off+26),extraSize=read16(bytes,off+28),dataStart=off+30+nameSize+extraSize;
   if(dataStart+packed>bytes.length)throw Error('BGM ZIP corrupt');
   const name=new TextDecoder('utf-8').decode(bytes.subarray(off+30,off+30+nameSize));
   if(/\.mp3$/i.test(name)){
    let file;
    if(method===8){
     const stream=new Blob([bytes.slice(dataStart,dataStart+packed)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
     file=await new Response(stream).blob();
    }else if(method===0){file=new Blob([bytes.slice(dataStart,dataStart+packed)]);}
    else throw Error('Unsupported BGM compression '+method);
    objects.push({name,url:URL.createObjectURL(new Blob([file],{type:'audio/mpeg'}))});
   }
   off=dataStart+packed;
  }
  objects.sort((a,b)=>a.name.localeCompare(b.name,'ko',{numeric:true}));
  if(objects.length!==4)throw Error('Expected 4 BGM tracks, received '+objects.length);
  tracks=objects.map(x=>x.url);return tracks;
 })().catch(e=>{console.warn('BGM unavailable',e);loading=null;return []});
 return loading;
}
function shuffleOrder(){
 shuffled=tracks.map((_,i)=>i);
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
}
let previewMode=false;
const bgm={
 get available(){return tracks.length===4;},
 get playing(){return playing;},
 setVolume(v){
  if(soundtrack)soundtrack.volume=Math.max(0,Math.min(1,Number(v)/100||0));
  if(prefs.bgm===0){this.pause();return;}
  if(!document.hidden&&(previewMode||!window.__homeIsOpen))this.play(previewMode);
 },
 async play(preview=false){
  if(preview)previewMode=true;
  if(prefs.bgm<=0||document.hidden||(window.__homeIsOpen&&!previewMode))return false;
  if(!tracks.length){await loadBgm();if(!tracks.length)return false;}
  if(prefs.bgm<=0||document.hidden||(window.__homeIsOpen&&!previewMode))return false;
  if(!soundtrack){
   soundtrack=new Audio();
   soundtrack.preload='auto';
   soundtrack.addEventListener('ended',()=>this.next());
   shuffleOrder();trackIndex=0;soundtrack.src=tracks[shuffled[trackIndex]];
  }
  soundtrack.volume=prefs.bgm/100;
  if(!soundtrack.paused){playing=true;return true;}
  try{await soundtrack.play();playing=true;return true;}
  catch(e){playing=false;console.warn('BGM playback needs interaction',e);return false;}
 },
 preview(){return this.play(true);},
 next(){
  if(!tracks.length)return;
  trackIndex++;
  if(trackIndex>=shuffled.length){shuffleOrder();trackIndex=0;}
  if(soundtrack){soundtrack.src=tracks[shuffled[trackIndex]];playing=false;this.play(previewMode);}
 },
 pause(){if(soundtrack)soundtrack.pause();playing=false;previewMode=false;}
};
window.wwBgm=bgm;
// Original, self-contained procedural game sounds: no third-party files or licenses.
const playSfx=(()=>{
 let ctx=null,noiseBuffer=null;
 const last=Object.create(null);
 const limits={bite:90,swallow:260,fart:240,crawl:235,crack:220,card:400};
 function audio(){
  if(!Number(prefs.sfx)||document.hidden)return null;
  try{
   if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();}
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   return ctx;
  }catch(e){return null;}
 }
 function white(c){
  if(noiseBuffer&&noiseBuffer.sampleRate===c.sampleRate)return noiseBuffer;
  const frames=Math.ceil(c.sampleRate*.7),b=c.createBuffer(1,frames,c.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<frames;i++)a[i]=Math.random()*2-1;
  noiseBuffer=b;return b;
 }
 function tone(c,at,duration,start,end,level,type){
  const o=c.createOscillator(),g=c.createGain(),v=Math.min(1,Math.max(0,Number(prefs.sfx)/100));
  o.type=type||'sine';
  o.frequency.setValueAtTime(Math.max(25,start),at);
  o.frequency.exponentialRampToValueAtTime(Math.max(25,end),at+duration);
  g.gain.setValueAtTime(.0001,at);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*v),at+Math.min(.025,duration*.24));
  g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g);g.connect(c.destination);o.start(at);o.stop(at+duration+.005);
 }
 function rustle(c,at,duration,level,frequency,filterType){
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  const v=Math.min(1,Math.max(0,Number(prefs.sfx)/100));
  src.buffer=white(c);f.type=filterType||'bandpass';f.frequency.value=frequency;f.Q.value=.75;
  g.gain.setValueAtTime(.0001,at);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*v),at+.014);
  g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  src.connect(f);f.connect(g);g.connect(c.destination);
  src.start(at);src.stop(at+duration+.005);
 }
 return function(kind){
  if(!Object.prototype.hasOwnProperty.call(limits,kind))return false;
  const nowMs=performance.now();
  if(nowMs-(last[kind]??-1e9)<limits[kind])return false;
  const c=audio();if(!c)return false;
  last[kind]=nowMs;const t=c.currentTime+.006;
  try{
   if(kind==='bite'){
    rustle(c,t,.12,.19,1900,'highpass');
    rustle(c,t+.05,.095,.12,2700,'highpass');
    tone(c,t,.13,210,112,.095,'triangle');
   }else if(kind==='swallow'){
    tone(c,t,.28,440,95,.23,'sine');
    tone(c,t+.13,.18,220,88,.13,'triangle');
    rustle(c,t+.03,.20,.045,680,'bandpass');
   }else if(kind==='fart'){
    tone(c,t,.37,156,52,.21,'sawtooth');
    tone(c,t+.07,.31,90,45,.10,'triangle');
    rustle(c,t+.025,.31,.058,360,'lowpass');
   }else if(kind==='crawl'){
    rustle(c,t,.11,.033,680,'bandpass');
    tone(c,t,.085,105,88,.018,'sine');
   }else if(kind==='crack'){
    rustle(c,t,.29,.21,1800,'highpass');
    rustle(c,t+.12,.26,.13,720,'bandpass');
    tone(c,t,.24,170,65,.08,'triangle');
   }else if(kind==='card'){
    tone(c,t,.24,840,1320,.15,'sine');
    tone(c,t+.12,.28,1240,1860,.11,'sine');
   }
   return true;
  }catch(e){console.warn('SFX',e);return false;}
 };
})();
window.wwSfx=playSfx;
const drawerAudio=document.getElementById('homeDrawer');
drawerAudio?.addEventListener('click',async e=>{
 const btn=e.target.closest('[data-ww-audio-test]');
 if(!btn)return;
 e.preventDefault();
 const hint=document.getElementById('wwAudioHint');
 if(btn.dataset.wwAudioTest==='sfx'){
  const ok=playSfx('bite');
  if(hint)hint.textContent=ok?'바삭! 먹기 효과음 재생 중 · 효과음 슬라이더로 조절해.':'효과음이 0이거나 오디오를 시작할 수 없어.';
 }else{
  if(prefs.bgm===0){if(hint)hint.textContent='배경음악 음량을 1 이상으로 올려줘.';return;}
  if(hint)hint.textContent='배경음악을 불러오는 중…';
  const ok=await bgm.preview();
  if(hint&&hint.isConnected)hint.textContent=ok?'음악 재생 중 · 슬라이더를 움직여 바로 확인해.':'음악 재생에 실패했어. 터치한 뒤 다시 눌러줘.';
 }
});

loadBgm(); // Prefetch while on the home screen: audio playback still needs user interaction.
// HUD: preserve original element IDs and events. Move the existing save button, never duplicate it.
const app=document.getElementById('app'),saveBtn=document.getElementById('saveBtn');
if(app&&saveBtn){
 const hud=document.createElement('div');hud.id='wwHud';hud.setAttribute('aria-label','게임 정보');
 hud.innerHTML='<div class="ww-knot" id="wwLevel" aria-label="레벨"><small>Lv.</small><strong id="wwLevelValue">1</strong></div>'+
 '<div class="ww-center"><div class="ww-capture"><strong id="wwCapture">0%</strong><small id="wwZone">1/6</small></div><div class="ww-bites" id="wwBites"></div><div class="ww-stretch" aria-label="몸 길이"><i id="wwStretch"></i></div></div>'+
 '<div class="ww-side"><div class="ww-hearts" id="wwHearts"><span>♥</span><span>♥</span><span>♥</span></div><button type="button" class="ww-coin ww-coin-help" id="wwCoinHelp" title="코인 보상표 보기" aria-label="코인 획득 규칙 보기"><span class="ww-gold">✦</span><strong id="wwCoins">0</strong></button><div class="ww-side-footer" id="wwSideFooter"><button id="wwPauseBtn" aria-label="일시정지" title="일시정지">Ⅱ</button></div></div>';
 app.appendChild(hud);
 saveBtn.textContent='⌂ 저장';saveBtn.title='저장 후 종료';saveBtn.setAttribute('aria-label','저장 후 홈으로 돌아가기');
 hud.querySelector('#wwSideFooter').prepend(saveBtn);
 hud.querySelector('#wwPauseBtn').addEventListener('click',()=>{if(typeof showPanel==='function'&&!window.__homeIsOpen)showPanel('menu')});
 hud.querySelector('#wwCoinHelp').addEventListener('click',()=>{if(typeof showPanel==='function'&&!window.__homeIsOpen&&state?.hearts>0)showPanel('coinRules')});
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
if(title){const h=title.querySelector('h1'),sub=title.querySelector('p');if(h)h.innerHTML='<span>와구</span> <span>와구</span>';if(sub)sub.textContent='WAGU WAGU';const kicker=title.querySelector('.home-kicker');if(kicker)kicker.textContent='WAGU · WAGU';}
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
document.addEventListener('visibilitychange',()=>{if(document.hidden)bgm.pause();else if(!window.__homeIsOpen&&prefs.bgm>0)bgm.play();});
window.addEventListener('pointerdown',()=>{if(!window.__homeIsOpen)bgm.play()},{passive:true});
apply();
})();
