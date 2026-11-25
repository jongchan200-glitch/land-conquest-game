/* WAGU WAGU · Work larva stage-1 game adapter v0.2.28
 * OPT-IN ONLY: ?larva=1. Original save, gameplay physics, and renderer remain
 * unchanged otherwise. Sources: character-production/larva-stage-1/parts.
 * Existing continuous anchored-body renderer is deliberately reused:
 * Work's per-segment-spawn rig is not silently passed off as true stretch.
 */
(function(){
  'use strict';
  const params=new URLSearchParams(location.search);
  if(params.get('larva')!=='1')return;
  const prefix='./character-production/larva-stage-1/parts/';
  const pieces={};
  for(const name of ['skin','eye0','eye1','ring','antenna']){
    const im=new Image();im.src=prefix+name+'.png?v=028';pieces[name]=im;
  }
  function ready(n){return pieces[n]&&pieces[n].complete&&pieces[n].naturalWidth>0;}
  const native=window.landTopWorm;
  if(!native||typeof native.body!=='function'||typeof native.player!=='function')return;
  const stageBox=document.createElement('div');
  stageBox.id='larvaPreviewTag';
  stageBox.textContent='애벌레 새 원화 · 시험 적용';
  Object.assign(stageBox.style,{position:'fixed',left:'50%',top:'calc(env(safe-area-inset-top) + 118px)',transform:'translateX(-50%)',zIndex:'5',background:'rgba(15,46,40,.85)',border:'1px solid #f5d9a3',borderRadius:'12px',padding:'5px 9px',font:'700 10px system-ui',color:'#ffefd1',pointerEvents:'none',whiteSpace:'nowrap'});
  document.body.appendChild(stageBox);
  const a=document.createElement('a');
  a.textContent='기존 애벌레';
  a.href=location.pathname+'?'+[...params.entries()].filter(([k])=>k!=='larva').map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
  Object.assign(a.style,{position:'fixed',bottom:'calc(env(safe-area-inset-bottom) + 148px)',right:'10px',zIndex:'7',color:'#f7e9c4',background:'rgba(9,33,40,.9)',font:'700 11px system-ui',padding:'7px 10px',borderRadius:'10px',textDecoration:'none',border:'1px solid #c3dfc0'});
  document.body.appendChild(a);
  function drawPiece(c,name,rect,dx,dy,sx=1,sy=1){
    if(!ready(name))return false;
    const im=pieces[name],unit=sx;
    c.drawImage(im,dx*unit,dy*sy,im.naturalWidth*unit,im.naturalHeight*sy);
    return true;
  }
  function shortBody(c,size,cycle,extended){
    if(extended)return;
    c.save();
    const colors=['#ce8f7e','#f0b9a1','#f3c9ae','#f4c7aa','#f3c2a5','#f5c4ac'];
    for(let i=5;i>=0;i--){
      const t=i/5,offset=15+i*8.1,rad=(16.2-i*.95)*(size/75);
      const wriggle=Math.sin(cycle*6.2-i*.78)*1.6;
      const x=wriggle,y=offset;
      c.fillStyle='rgba(20,28,25,.15)';c.beginPath();c.ellipse(x+2,y+3,rad*.91,rad*.80,0,0,Math.PI*2);c.fill();
      c.fillStyle=colors[i];c.beginPath();c.ellipse(x,y,rad,rad*.94,0,0,Math.PI*2);c.fill();
      c.fillStyle='rgba(255,243,222,.45)';c.beginPath();c.ellipse(x-rad*.28,y-rad*.33,rad*.46,rad*.24,-.3,0,Math.PI*2);c.fill();
      c.fillStyle='#eccc76';c.beginPath();c.ellipse(x-2,y+rad*.13,rad*.29,rad*.18,0,0,Math.PI*2);c.fill();
      if(i%2===0)for(const side of [-1,1]){
        c.fillStyle='#d78d80';c.beginPath();c.ellipse(x+side*rad*.88,y+rad*.46,rad*.25,rad*.13,side*.5,0,Math.PI*2);c.fill();
      }
    }
    c.restore();
  }
  function previewPlayer(){
    if(!player||!ready('skin')||!ready('ring')){native.player();return;}
    const p=mapPosition();
    const extended=bodyLine.length>1&&bodyTotal>.08;
    const fullness=Math.max(0,Math.min(1,(state.fullness||0)/Math.max(1,biteMax())));
    const gulp=digest>0;
    const jaw=Math.max(0,Math.min(1,biteVisual()));
    const levelScale=larvaLevelSize();
    // The reference head has a front-facing lower edge: its top faces -Y.
    // Game heading is remapped to that canonical forward axis.
    let heading=Number.isFinite(player.turnAngle)?player.turnAngle:Math.atan2(player.dirY,player.dirX);
    if(extended&&bodyLine.length>2){
      const tip=bodyLine[bodyLine.length-1],rear=bodyLine[Math.max(0,bodyLine.length-7)];
      if(Math.hypot(tip.x-rear.x,tip.y-rear.y)>.04)heading=Math.atan2(tip.y-rear.y,tip.x-rear.x);
    }
    const headingRotation=heading-Math.PI/2;
    const progress=gulp?Math.min(1,Math.max(0,1-digest/.64)):0;
    const lift=gulp?Math.sin(progress*Math.PI)*8:0;
    const sz=(extended?74:79)*levelScale;
    const scale=sz/216;
    const cycle=player.walkCycle||0;
    const wobble=Math.sin(cycle*6)*1.2;
    ctx.save();
    ctx.translate(p.x,p.y+wobble-lift);
    ctx.rotate(headingRotation);
    shortBody(ctx,sz,cycle,extended);
    // Parent transform: Work's painted head is 216x177, pivot near the muzzle.
    ctx.scale(scale,scale);
    ctx.translate(-108,-99);
    ctx.shadowColor='rgba(34,31,32,.34)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
    ctx.drawImage(pieces.skin,0,0,216,177);
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    // Puff cheeks are independent from the two-eye and whisker layers.
    const puff=fullness*.22;
    for(const side of [-1,1]){
      const cx=side<0?43:166,cy=112;
      ctx.save();ctx.translate(cx,cy);ctx.scale(1+puff*1.4,1+puff*.85);
      ctx.fillStyle='#f6b9ad';ctx.strokeStyle='rgba(197,125,120,.26)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.ellipse(0,0,21,23,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.restore();
    }
    if(ready('eye0'))ctx.drawImage(pieces.eye0,20,55);
    if(ready('eye1'))ctx.drawImage(pieces.eye1,111,62);
    // Black ring moustache remains independent from the true mouth underneath.
    ctx.save();ctx.translate(80,129);
    const mouthP=jaw*.23+(gulp?Math.sin(progress*Math.PI)*.06:0);
    ctx.scale(1+mouthP*.6,1+mouthP);
    ctx.translate(-80,-129);
    ctx.drawImage(pieces.ring,36,88);
    ctx.restore();
    // Small open-mouth patch inside ring on each bite.
    if(jaw>.04){
      ctx.fillStyle='rgba(56,28,37,'+(jaw*.81).toFixed(3)+')';
      ctx.beginPath();ctx.ellipse(79,131,14,7+jaw*8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,167,158,'+(jaw*.75).toFixed(3)+')';
      ctx.beginPath();ctx.ellipse(79,136,8,2+jaw*2,0,0,Math.PI*2);ctx.fill();
    }
    if(ready('antenna')){
      ctx.save();ctx.translate(106,20);ctx.rotate(Math.sin(cycle*2.1)*.035);ctx.translate(-106,-20);
      ctx.drawImage(pieces.antenna,78,-68);ctx.restore();
    }
    ctx.restore();
  }
  window.landTopWorm={...native,player:previewPlayer,revision:'v0.2.28-work-art-optin'};
  window.WAGU_LARVA_PREVIEW={active:true,source:prefix,artReady:()=>Object.values(pieces).every(im=>im.complete&&im.naturalWidth>0),renderer:'Work-head + established continuous body path'};
})();
