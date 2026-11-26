/* WAGU WAGU v0.2.34: 2D lobby/character preview.
 * Head and body drawing copied from the active gameplay v0.2.13/v0.2.14
 * renderers at 746989f. Same shapes, skin palette and evolution details.
 * Preview has its own points and heading; never touches game movement or save.
 * No WebGL, Work renderer, or pitch/vertical tilt.
 */
(function(){
  'use strict';
  const TAU=Math.PI*2, STEP=Math.PI/4;
  const ellipse=(c,x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);};
function topHead(c,x,y,scale,angle,jaw,full,fade=1){
    c.save();c.globalAlpha*=fade;c.translate(x,y);c.rotate(angle+Math.PI/2);c.scale(scale,scale);
    const bob=0;
    c.translate(0,-1.2-jaw*3.6+bob);
    // Rounded head is part of the continuous body, colored by the same palette.
    c.shadowColor='rgba(82,43,29,.28)';c.shadowBlur=8;c.shadowOffsetY=3;
    ellipse(c,0,0,29+full*2,31+jaw*2);const g=c.createRadialGradient(-12,-15,1,1,4,43);
    g.addColorStop(0,'#fff0d5');g.addColorStop(.42,'#ffdbb6');g.addColorStop(.83,skinTone('head'));g.addColorStop(1,skinTone('dark'));
    c.fillStyle=g;c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
    // Cheeks grow with collected bites, physically visible from top view.
    for(const sign of [-1,1]){
      ellipse(c,sign*(21+full*3),-2,7.8+full*6.2,12.5+full*5);
      const cheek=c.createRadialGradient(sign*25,-7,1,sign*22,0,22);
      cheek.addColorStop(0,'rgba(255,184,160,.92)');cheek.addColorStop(1,'rgba(228,105,105,0)');
      c.fillStyle=cheek;c.fill();
    }
    // Two short flexible antennae, deliberately visible in top-down view.
    c.strokeStyle='#a96653';c.lineWidth=2.7;c.lineCap='round';
    for(const sign of [-1,1]){
      c.beginPath();c.moveTo(sign*11,-22);c.quadraticCurveTo(sign*(13+Math.sin(sign)*2),-39,sign*18,-44-jaw*2);c.stroke();
      ellipse(c,sign*18,-44-jaw*2,4.1,4.6);c.fillStyle='#edac80';c.fill();
    }
    // Eyes near the front: small from above, not a pasted frontal face.
    for(const sign of [-1,1]){
      ellipse(c,sign*12,-18,5.8,7.0);c.fillStyle='#fff9ec';c.fill();
      ellipse(c,sign*12,-20,3.2,3.9);c.fillStyle='#513b39';c.fill();
      ellipse(c,sign*13,-21.5,1.25,1.6);c.fillStyle='#fff';c.fill();
    }
    // Thin, single circular whisker around a mouth at the foremost rim.
    c.strokeStyle='#945c4c';c.lineWidth=1.5;
    ellipse(c,0,-29-jaw*2,5.8+jaw*4.0,3.6+jaw*4.4);c.stroke();
    ellipse(c,0,-30-jaw*2,1.5+jaw*5,0.7+jaw*4.5);c.fillStyle='#663f3d';c.fill();
    if(jaw>.14){ellipse(c,0,-29-jaw*2,1+jaw*2.8,0.6+jaw*2.3);c.fillStyle='#f3a4a3';c.fill();}
    // A small, blunt forehead horn grows gradually; stage 1 is unmodified.
    const evo=evolutionStage(),palette=EVOLUTION_COLORS[evo-1];
    if(evo>=2){
      const height=[0,0,8,13,18,24][evo],half=2.5+evo*.65;
      c.save();c.shadowColor=palette.gem;c.shadowBlur=3+evo;
      c.fillStyle=palette.gem;c.strokeStyle='rgba(150,97,67,.42)';c.lineWidth=.7;
      c.beginPath();c.moveTo(-half,-6);c.quadraticCurveTo(-half*.8,-11-height*.38,0,-7-height);
      c.quadraticCurveTo(half*.8,-11-height*.38,half,-6);
      c.quadraticCurveTo(0,-1, -half,-6);c.closePath();c.fill();c.stroke();c.restore();
    }
    // Cute ivory cheek-tusks appear only at stage 3, becoming gently longer.
    if(evo>=3){
      const size=[0,0,0,3.5,5.5,8][evo];
      c.fillStyle=palette.tip;c.strokeStyle='rgba(147,106,80,.26)';c.lineWidth=.7;
      for(const side of [-1,1]){
        c.beginPath();c.moveTo(side*25,7);c.quadraticCurveTo(side*(30+size*.36),0,side*(30+size),-2-size*.33);
        c.quadraticCurveTo(side*(32+size*.4),12,side*25,12);c.closePath();c.fill();c.stroke();
      }
    }
    c.restore();
  }
  function drawBody(data,c,angle){
    const {pts}=data,first=pts[0],last=pts[pts.length-1];
    c.save();c.lineJoin='round';c.lineCap='round';
    // Underpaint the centerline with overlapping skin capsules. Prevents ANY
    // transparent interior slots at acute turns or when the head is moving.
    c.fillStyle=skinTone('base');c.strokeStyle=skinTone('base');
    for(let i=1;i<pts.length;i++){
      const p=pts[i-1],q=pts[i];
      c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);
      c.lineWidth=1.88*Math.max(p.r,q.r);c.stroke();
    }
    const area=new Path2D();
    for(let i=0;i<pts.length;i++){const q=pts[i],x=q.x+q.nx*q.r,y=q.y+q.ny*q.r;
      if(i===0)area.moveTo(x,y);else area.lineTo(x,y);}
    area.quadraticCurveTo(last.x+Math.cos(angle)*last.r*.85,last.y+Math.sin(angle)*last.r*.85,last.x-last.nx*last.r,last.y-last.ny*last.r);
    for(let i=pts.length-2;i>=0;i--){const q=pts[i];area.lineTo(q.x-q.nx*q.r,q.y-q.ny*q.r);}
    area.quadraticCurveTo(first.x-Math.cos(angle)*first.r,first.y-Math.sin(angle)*first.r,first.x+first.nx*first.r,first.y+first.ny*first.r);
    area.closePath();
    const mid=pts[Math.floor(pts.length/2)],r=mid.r;
    const grad=c.createLinearGradient(mid.x+mid.nx*r,mid.y+mid.ny*r,mid.x-mid.nx*r,mid.y-mid.ny*r);
    grad.addColorStop(0,'#ffedd5');grad.addColorStop(.27,skinTone('light'));grad.addColorStop(.57,skinTone('base'));grad.addColorStop(1,skinTone('dark'));
    c.shadowColor='rgba(75,42,30,.25)';c.shadowBlur=6;c.shadowOffsetY=3;c.fillStyle=grad;c.fill(area);
    c.shadowBlur=0;c.shadowOffsetY=0;
    c.save();c.clip(area);
    // Subtle joint creases follow the muscle wave and can never tear the skin.
    const folds=Math.max(5,Math.min(14,Math.round(data.visibleLength/23)));
    for(let j=1;j<folds;j++){
      const q=pts[Math.round(j/(folds)*(pts.length-1))],r=q.r;
      c.beginPath();c.moveTo(q.x-q.nx*r*.68,q.y-q.ny*r*.68);
      c.quadraticCurveTo(q.x+Math.cos(angle)*3,q.y+Math.sin(angle)*3,q.x+q.nx*r*.60,q.y+q.ny*r*.60);
      c.strokeStyle='rgba(151,83,61,.12)';c.lineWidth=1.6;c.stroke();
    }
    c.beginPath();for(let i=0;i<pts.length;i++){
      const q=pts[i],x=q.x+q.nx*q.r*.62,y=q.y+q.ny*q.r*.62;
      if(!i)c.moveTo(x,y);else c.lineTo(x,y);}
    c.strokeStyle='rgba(255,250,222,.34)';c.lineWidth=3.3;c.stroke();
    c.restore();
    // Draw each stage's color accents and blunt nubs ON the live deformed
    // spine. Turning, stretching and contracting always carries the details.
    const evo=evolutionStage(),pal=EVOLUTION_COLORS[evo-1];
    if(evo>1){
      const count=evo+2;
      c.save();c.clip(area);
      if(evo>=3)for(let j=1;j<=count;j++){
        const q=pts[Math.round(j/(count+1)*(pts.length-1))];
        const a=Math.atan2(q.ny,q.nx)+Math.PI/2;
        c.save();c.translate(q.x,q.y);c.rotate(a);
        c.strokeStyle=pal.stripe;c.globalAlpha=evo===5?.63:.30+(evo-3)*.12;
        c.lineWidth=5+evo*1.35;c.lineCap='round';
        c.beginPath();c.moveTo(-q.r*.72,0);c.quadraticCurveTo(0,-4,q.r*.72,0);c.stroke();c.restore();
      }
      c.restore();
      for(let j=1;j<=count;j++){
        const q=pts[Math.round(j/(count+1)*(pts.length-1))],size=2.1+evo*1.15;
        const tx=q.ny,ty=-q.nx;
        c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(ty,tx)+Math.PI/2);
        c.fillStyle=pal.gem;c.strokeStyle='rgba(121,77,51,.24)';c.lineWidth=.65;
        c.beginPath();c.moveTo(0,-size*1.55);c.quadraticCurveTo(size*.86,-size*.3,0,size*.90);
        c.quadraticCurveTo(-size*.86,-size*.3,0,-size*1.55);c.fill();c.stroke();c.restore();
        if(evo>=3)for(const side of [-1,1]){
          const tip=2+(evo-2)*1.65;
          c.fillStyle=pal.tip;c.beginPath();
          c.moveTo(q.x+q.nx*side*q.r*.79,q.y+q.ny*side*q.r*.79);
          c.quadraticCurveTo(q.x+q.nx*side*(q.r+tip*.48)+tx*3,q.y+q.ny*side*(q.r+tip*.48)+ty*3,
            q.x+q.nx*side*(q.r+tip)+tx*1.5,q.y+q.ny*side*(q.r+tip)+ty*1.5);
          c.quadraticCurveTo(q.x+q.nx*side*q.r*.73+tx*4,q.y+q.ny*side*q.r*.73+ty*4,
            q.x+q.nx*side*q.r*.79,q.y+q.ny*side*q.r*.79);c.fill();
        }
      }
    }
    c.restore();
  }

  const main=document.getElementById('homeModelCanvas');
  if(!main)return;
  let yaw=Math.PI/4,target=yaw,showBadge=false,frameCount=0;
  const bindings=new WeakMap(), cache=new WeakMap();
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const setYaw=a=>{if(Number.isFinite(a))target=wrap(a);};
  const step=d=>setYaw(target+d*Math.PI/2);
  function points(angle){
    const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx,pts=[];
    for(let i=0;i<=36;i++){
      const u=i/36,l=-66+98*u,side=8*Math.sin(Math.PI*u);
      const tangent=8*Math.PI*Math.cos(Math.PI*u)/98;
      const tx=dx+nx*tangent,ty=dy+ny*tangent,len=Math.hypot(tx,ty)||1;
      pts.push({u,x:dx*l+nx*side,y:dy*l+ny*side,nx:-ty/len,ny:tx/len,r:7.8+16.7*Math.pow(u,.63)+2.5*Math.sin(Math.PI*u)});
    }
    return {pts,visibleLength:98};
  }
  function drawOne(canvas){
    if(!canvas||!canvas.isConnected||canvas.clientWidth<2||canvas.clientHeight<2)return;
    const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight),dpr=Math.min(2,window.devicePixelRatio||1);
    const W=Math.round(w*dpr),H=Math.round(h*dpr);
    const evo=evolutionStage(),skin=skinTone('base');
    const key=[W,H,yaw.toFixed(4),evo,skin,showBadge].join('|');
    if(cache.get(canvas)===key)return;
    const c=canvas.getContext('2d',{alpha:true});
    if(!c)return;
    if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
    const scale=Math.min(w/175,h/165)*(.88+(evo-1)*.027);
    c.save();c.translate(w*.5,h*.5);c.scale(scale,scale*.86);
    const data=points(yaw),head=data.pts[data.pts.length-1];
    drawBody(data,c,yaw);
    topHead(c,head.x,head.y,1,yaw,0,0);
    if(showBadge){
      const q=data.pts[18];c.save();c.translate(q.x,q.y);
      c.fillStyle='#ffdf85';c.strokeStyle='#9d6426';c.lineWidth=1;
      c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?3.7:8;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fill();c.stroke();c.restore();
    }
    c.restore();cache.set(canvas,key);frameCount++;
  }
  function attachPreview(canvas){
    if(!canvas||bindings.has(canvas))return;
    const gesture={id:null,x:0,y:0,horizontal:false};
    bindings.set(canvas,gesture);
    canvas.tabIndex=0;
    canvas.addEventListener('pointerdown',e=>{
      if(gesture.id!==null||e.button>0)return;
      gesture.id=e.pointerId;gesture.x=e.clientX;gesture.y=e.clientY;gesture.horizontal=false;
    });
    canvas.addEventListener('pointermove',e=>{
      if(e.pointerId!==gesture.id)return;
      const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
      if(!gesture.horizontal){
        if(Math.abs(dy)>9&&Math.abs(dy)>Math.abs(dx)*1.2){gesture.id=null;return;}
        if(Math.abs(dx)<5||Math.abs(dx)<Math.abs(dy))return;
        gesture.horizontal=true;
        try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      }
      setYaw(target+dx*Math.PI/200);gesture.x=e.clientX;gesture.y=e.clientY;
      if(e.cancelable)e.preventDefault();
    });
    function end(e){
      if(e.pointerId!==gesture.id)return;
      if(gesture.horizontal)setYaw(Math.round(target/STEP)*STEP);
      gesture.id=null;gesture.horizontal=false;
    }
    for(const n of ['pointerup','pointercancel','lostpointercapture','pointerleave'])canvas.addEventListener(n,e=>{if(n==='pointerleave'&&gesture.horizontal)return;end(e);});
    canvas.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){step(e.key==='ArrowLeft'?-1:1);e.preventDefault();}
    });
  }
  attachPreview(main);
  window.home3D={active:true,mode:'2d-game-renderer',setBadge(b){showBadge=!!b;},getYaw:()=>target,setYaw,getPitch:()=>0,getFrameCount:()=>frameCount,attachPreview};
  let lastT=0;
  function tick(t){
    requestAnimationFrame(tick);
    const dt=lastT?Math.min(.05,Math.max(0,(t-lastT)/1000)):1/60;lastT=t;
    if(document.hidden||!window.__homeIsOpen)return;
    const delta=wrap(target-yaw);
    yaw=Math.abs(delta)<.003?target:wrap(yaw+delta*(1-Math.exp(-18*dt)));
    drawOne(main);
    const preview=document.getElementById('homeCharacterPreview');
    if(preview){attachPreview(preview);drawOne(preview);}
  }
  requestAnimationFrame(tick);
})();
