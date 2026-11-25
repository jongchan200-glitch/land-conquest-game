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
  stageBox.textContent='새 애벌레 몸통·머리 · 시험 적용';
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
  // One coherent Work-art caterpillar: 8 anatomical body sections, not
  // new segments spawned as the cutting path grows. Canvas geometry comes
  // from the EXISTING anchored path but the OLD sprite/body is never painted.
  // Thus gameplay collision, capture and save stay identical.
  const SECTION_COUNT=8;
  // Fixed anatomy: the caterpillar ALWAYS has its full resting-length body.
  // Crossing the first edible cell only anchors the tail; it must not replace
  // that body with the near-zero-length cutting path.
  const BASE_BODY_PIXELS=90;
  const BODY_SAMPLES=96;
  function centerline(){
    if(!player)return null;
    const p=mapPosition(),baseLength=BASE_BODY_PIXELS*larvaLevelSize();
    const worldPath=bodyLine.length>0&&bodyAnchor&&bodyTotal>=0;
    const from=worldPath&&bodyLine.length>1
      ?bodyLine.map(v=>({x:v.x*T,y:v.y*T}))
      :[];
    const heading=Number.isFinite(player.turnAngle)
      ?player.turnAngle:Math.atan2(player.dirY,player.dirX);
    let ux=Math.cos(heading),uy=Math.sin(heading);
    if(from.length>1){
      const first=from[0];
      for(let i=1;i<from.length;i++){
        const dx=from[i].x-first.x,dy=from[i].y-first.y,len=Math.hypot(dx,dy);
        if(len>2){ux=dx/len;uy=dy/len;break;}
      }
    }
    // When a bite begins, the tail's actual resting-length tip is behind the
    // start anchor. Keep this extra length even while the live cut grows.
    const anchor=worldPath
      ?{x:bodyAnchor.x*T,y:bodyAnchor.y*T}
      :{x:p.x,y:p.y};
    const start={x:anchor.x-ux*baseLength,y:anchor.y-uy*baseLength};
    const poly=[start,anchor];
    if(worldPath&&from.length>1){
      for(let i=1;i<from.length;i++){
        const q=from[i],last=poly[poly.length-1];
        if(Math.hypot(q.x-last.x,q.y-last.y)>.12)poly.push(q);
      }
      // The visual head must be attached to the actual render position.
      const tip=poly[poly.length-1];
      if(Math.hypot(p.x-tip.x,p.y-tip.y)>.3)poly.push({x:p.x,y:p.y});
    }
    const lengths=[0];
    for(let i=1;i<poly.length;i++)
      lengths.push(lengths[i-1]+Math.hypot(poly[i].x-poly[i-1].x,poly[i].y-poly[i-1].y));
    const total=lengths[lengths.length-1];
    if(total<1)return null;
    const pts=[];let seg=1;
    const wave=player.walkCycle||0;
    for(let i=0;i<=BODY_SAMPLES;i++){
      const u=i/BODY_SAMPLES,d=u*total;
      while(seg<poly.length-1&&lengths[seg]<d)seg++;
      const prev=poly[seg-1],next=poly[seg],span=lengths[seg]-lengths[seg-1];
      const k=span>0?Math.min(1,Math.max(0,(d-lengths[seg-1])/span)):0;
      let x=prev.x+(next.x-prev.x)*k,y=prev.y+(next.y-prev.y)*k;
      // Tiny gait ripple, pinned to zero at both ends to prevent disconnects.
      const move=Math.sin(wave*6.1-u*20)*Math.sin(u*Math.PI)*1.25;
      const tx=next.x-prev.x,ty=next.y-prev.y,tl=Math.hypot(tx,ty)||1;
      x+=(-ty/tl)*move;y+=(tx/tl)*move;
      pts.push({x,y,u});
    }
    for(let i=0;i<pts.length;i++){
      const q0=pts[Math.max(0,i-1)],q1=pts[Math.min(pts.length-1,i+1)];
      const dx=q1.x-q0.x,dy=q1.y-q0.y,n=Math.hypot(dx,dy)||1;
      pts[i].nx=-dy/n;pts[i].ny=dx/n;
    }
    return {pts,stretched:worldPath,fade:1,length:total,baseLength,extension:Math.max(0,total-baseLength)};
  }
  function wormBody(){
    if(!player)return;
    const data=centerline();if(!data)return;
    const pts=data.pts,stage=larvaLevelSize();
    const radius=u=>{
      const tail=10.4*stage,neck=23.0*stage;
      const taper=tail+(neck-tail)*Math.pow(u,.68);
      // Exactly eight permanent physical modules with a soft breathing profile.
      const muscle=1+.033*Math.cos(u*SECTION_COUNT*Math.PI*2-(player.walkCycle||0)*.42)*Math.sin(Math.PI*u);
      let r=taper*muscle;
      if(data.stretched&&gutBoluses.length){
        for(const bolus of gutBoluses){
          if(bolus.time<0)continue;
          const b=1-Math.max(0,Math.min(1,bolus.time/bolus.duration));
          const d=u-b;
          r+=9.3*Math.exp(-d*d/.0025)*(.6+.4*b);
        }
      }
      return r;
    };
    ctx.save();ctx.globalAlpha*=data.fade;
    const hull=new Path2D();
    for(let i=0;i<pts.length;i++){
      const v=pts[i],rr=radius(v.u),x=v.x+v.nx*rr,y=v.y+v.ny*rr;
      if(!i)hull.moveTo(x,y);else hull.lineTo(x,y);
    }
    const front=pts[pts.length-1],rf=radius(1);
    hull.quadraticCurveTo(front.x+rf*.6,front.y+rf*.5,front.x-front.nx*rf,front.y-front.ny*rf);
    for(let i=pts.length-2;i>=0;i--){
      const v=pts[i],rr=radius(v.u);hull.lineTo(v.x-v.nx*rr,v.y-v.ny*rr);
    }
    const tail=pts[0];hull.quadraticCurveTo(tail.x-6,tail.y-6,tail.x+tail.nx*radius(0),tail.y+tail.ny*radius(0));hull.closePath();
    ctx.save();ctx.shadowColor='rgba(58,31,26,.34)';ctx.shadowBlur=8;ctx.shadowOffsetY=4;
    const mid=pts[Math.floor(pts.length*.6)];
    const skin=ctx.createLinearGradient(mid.x+mid.nx*35,mid.y+mid.ny*35,mid.x-mid.nx*35,mid.y-mid.ny*35);
    skin.addColorStop(0,'#ffe8ca');skin.addColorStop(.35,'#f9c9b2');skin.addColorStop(.69,'#efb2a4');skin.addColorStop(1,'#c77b80');
    ctx.fillStyle=skin;ctx.fill(hull);ctx.restore();
    ctx.save();ctx.clip(hull);
    // Fixed eight ring-folds and oval dorsal spots follow the stretching skin.
    // The distance BETWEEN these marks grows, their count never changes.
    for(let i=1;i<=SECTION_COUNT;i++){
      const u=i/(SECTION_COUNT+1),v=pts[Math.round(u*(pts.length-1))],rr=radius(u);
      const tangent={x:-v.ny,y:v.nx};
      ctx.save();ctx.translate(v.x,v.y);
      ctx.rotate(Math.atan2(tangent.y,tangent.x));
      ctx.fillStyle='#efca7f';ctx.globalAlpha=.7;
      ctx.beginPath();ctx.ellipse(0,-rr*.28,Math.min(13,rr*.40),Math.max(2.2,rr*.18),0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.15;ctx.strokeStyle='#a96576';ctx.lineWidth=1.8;
      ctx.beginPath();ctx.moveTo(-rr*.68,0);ctx.quadraticCurveTo(0,2.5,rr*.68,0);ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      const v=pts[i],rr=radius(v.u);
      if(i===0)ctx.moveTo(v.x+v.nx*rr*.62,v.y+v.ny*rr*.62);
      else ctx.lineTo(v.x+v.nx*rr*.62,v.y+v.ny*rr*.62);
    }
    ctx.lineWidth=4;ctx.strokeStyle='rgba(255,250,221,.36)';ctx.stroke();
    ctx.restore();
    ctx.lineWidth=1.2;ctx.strokeStyle='rgba(142,75,83,.21)';ctx.stroke(hull);
    // Stubby crawling feet: short, visible only near the body's flanks.
    for(let i=1;i<=SECTION_COUNT;i++){
      const u=i/(SECTION_COUNT+1),v=pts[Math.round(u*(pts.length-1))],rr=radius(u);
      for(const side of [-1,1]){
        const step=Math.sin((player.walkCycle||0)*7-i*1.1+side)*1.4;
        const rootX=v.x+v.nx*side*rr*.84,rootY=v.y+v.ny*side*rr*.84;
        ctx.strokeStyle='#c98088';ctx.lineWidth=Math.max(2.0,rr*.23);ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(rootX,rootY);ctx.quadraticCurveTo(rootX+v.nx*side*4,rootY+v.ny*side*5,
          rootX+v.nx*side*(6+step),rootY+v.ny*side*(6+step)+3);ctx.stroke();
      }
    }
    ctx.restore();
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
    const sz=79*levelScale;
    const scale=sz/216;
    const cycle=player.walkCycle||0;
    const wobble=Math.sin(cycle*6)*1.2;
    ctx.save();
    ctx.translate(p.x,p.y+wobble-lift);
    ctx.rotate(headingRotation);
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
  window.landTopWorm={...native,body:wormBody,player:previewPlayer,revision:'v0.2.30-continuous-base-length'};
  window.WAGU_LARVA_PREVIEW={active:true,source:prefix,artReady:()=>Object.values(pieces).every(im=>im.complete&&im.naturalWidth>0),renderer:'Work head and complete 8-section rendered body, existing collision/path data'};
})();
