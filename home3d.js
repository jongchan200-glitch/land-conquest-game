/* WAGU WAGU v0.2.35: oblique side-view 2D home illustration. Gameplay renderer untouched. */
(function(){'use strict';
  const main=document.getElementById('homeModelCanvas');
  if(!main)return;
  let yaw=3*Math.PI/4,target=yaw,showBadge=false,frameCount=0;
  const bindings=new WeakMap(), cache=new WeakMap();
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const setYaw=a=>{if(Number.isFinite(a))target=wrap(a);};
  const step=d=>setYaw(target+d*Math.PI/2);
  // Fixed low oblique view: screen-space Canvas2D illustration, with
  // near/far layering and directional features. No pitch gestures or WebGL.
  const TAU=Math.PI*2, STEP=Math.PI/4;
  const elev=28*Math.PI/180, sinE=Math.sin(elev),cosE=Math.cos(elev);
  function drawOne(canvas){
    if(!canvas||!canvas.isConnected||canvas.clientWidth<2||canvas.clientHeight<2)return;
    const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight),dpr=Math.min(2,window.devicePixelRatio||1);
    const W=Math.round(w*dpr),H=Math.round(h*dpr);
    const evo=evolutionStage(),skin=skinTone('base'),pal=EVOLUTION_COLORS[evo-1];
    const key=[W,H,yaw.toFixed(4),evo,skin,showBadge].join('|');
    if(cache.get(canvas)===key)return;
    const c=canvas.getContext('2d',{alpha:true});if(!c)return;
    if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
    c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
    const scale=Math.min(w/205,h/148)*(.90+(evo-1)*.025);
    c.save();c.translate(w*.5,h*.60);c.scale(scale,scale);
    // World coordinates: +X points to the face, Z is upright.
    // At initial yaw the face is near-left and the tail recedes right.
    const cs=Math.cos(yaw),sn=Math.sin(yaw);
    const project=(x,y,z)=>({x:x*cs-y*sn,y:(x*sn+y*cs)*sinE-z*cosE,d:(x*sn+y*cs)*cosE+z*sinE});
    const parts=[];
    const color=(r,g,b)=>'rgb('+r+','+g+','+b+')';
    function oval(x,y,z,rx,ry,rz,light,mid,dark,bias=0){
      const p=project(x,y,z);
      const a=Math.sqrt((rx*cs)**2+(ry*sn)**2);
      const b=Math.sqrt(((rx*sn)**2+(ry*cs)**2)*sinE**2+rz**2*cosE**2);
      parts.push({d:p.d+bias,draw(){
        if(a<.1||b<.1)return;
        c.beginPath();c.ellipse(p.x,p.y,a,b,0,0,TAU);
        const g=c.createRadialGradient(p.x-a*.35,p.y-b*.43,Math.max(.1,b*.03),p.x+a*.12,p.y+b*.12,Math.max(a,b)*1.17);
        g.addColorStop(0,light);g.addColorStop(.48,mid);g.addColorStop(1,dark);
        c.fillStyle=g;c.fill();
      }});
    }
    function curve(points,width,col,bias=0){
      const p=points.map(v=>project(...v));
      parts.push({d:p.reduce((n,q)=>n+q.d,0)/p.length+bias,draw(){
        c.beginPath();c.moveTo(p[0].x,p[0].y);if(p.length===3)c.quadraticCurveTo(p[1].x,p[1].y,p[2].x,p[2].y);else for(let j=1;j<p.length;j++)c.lineTo(p[j].x,p[j].y);
        c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();
      }});
    }
    // soft grounded shadow
    c.save();c.scale(1,.52);c.beginPath();c.ellipse(0,12,82,35,0,0,TAU);
    const sh=c.createRadialGradient(0,12,8,0,12,82);sh.addColorStop(0,'rgba(15,35,27,.37)');sh.addColorStop(1,'rgba(15,35,27,0)');c.fillStyle=sh;c.fill();c.restore();
    const light=skinTone('light'),dark=skinTone('dark'),head=skinTone('head');
    // Full and tapering, overlapping soft body folds and cream belly.
    const segs=[[-55,12,12,12],[-43,16,16,16],[-29,20,20,19],[-13,24,23,22],[3,25,25,24]];
    segs.forEach(([x,rx,ry,rz],j)=>{
      const cy=rz+5;
      for(const side of [-1,1]){
        // small insect-like feet are individually depth sorted; far feet hide under the body.
        oval(x-3,side*ry*.70,5.5,6.8,5.2,5.1,'#fff0d7','#f0c69d','#b67f61',-.3);
      }
      oval(x,0,cy,rx,ry,rz,light,skin,dark);
      if(evo>=2){
        oval(x,0,cy+rz*.89,3.5+evo*.5,3.3+evo*.4,3.3+evo*.6,'#fff0cf',pal.gem,dark,.7);
        if(evo>=3)for(const side of [-1,1])oval(x,side*ry*.83,cy+2,4,2.2,4,light,pal.stripe,dark,.15);
      }
    });
    // The present game face: two antennae, blush, two small eyes and a
    // single circular mouth ring. Front facial parts are hidden at the back.
    const hx=34,hz=32,hr=30;
    oval(hx,0,hz,30,29,31,'#fff0d5','#ffdbb6',head);
    for(const side of [-1,1]){
      oval(hx+4,side*18,6,8,6,5,'#fff0d7','#f0c69d','#b67f61');
      // antenna tips grow from the scalp and stay upright through yaw.
      curve([[hx+3,side*12,hz+24],[hx+8,side*16,hz+42],[hx+10,side*19,hz+47]],2.9,'#a96653',1);
      oval(hx+10,side*19,hz+47,4.8,4.8,4.8,'#ffe5ba','#edac80','#a96653',1);
      if(sn>-.12){
        const near=side*cs>.10;
        if(sn>.46||near){
          oval(hx+23,side*14,hz+9,6.8,5.8,8.0,'#fffdf5','#fff9ec','#d49d7c',4);
          oval(hx+28,side*14.2,hz+9,3.1,3.3,5.0,'#766258','#513b39','#332526',5.4);
          oval(hx+29.8,side*14.2-1,hz+11.2,1.5,1.6,1.9,'#fff','#fff','#eee',6.4);
          oval(hx+18,side*22,hz-7,7.3,3.6,8.5,'#ffd0bc','#f7a2a1','#df8f8d',3);
        }
      }
    }
    if(sn>.16){
      // Face is not a sticker flipped to the rear. Compress the ring
      // in the side views and hide it entirely in the back view.
      const p=project(hx+30,0,hz-8),rx=7.7*Math.max(.21,sn),ry=6.3;
      parts.push({d:p.d+8,draw(){c.beginPath();c.ellipse(p.x,p.y,rx,ry,0,0,TAU);c.fillStyle='#f6bd9b';c.fill();c.strokeStyle='#945c4c';c.lineWidth=1.6;c.stroke();c.beginPath();c.ellipse(p.x,p.y+.5,rx*.34,ry*.3,0,0,TAU);c.fillStyle='#663f3d';c.fill();}});
    }
    if(evo>=2)oval(hx+19,0,hz+28,4+evo*.5,4+evo*.4,5+evo*2,'#fff1c7',pal.gem,dark,2);
    if(evo>=3&&sn>-.1)for(const side of [-1,1])if(sn>.48||side*cs>.1)oval(hx+18,side*24,hz-11,3,3,4+evo,'#fff9e0',pal.tip,'#d8b48d',3);
    if(showBadge){
      const p=project(-13,cs>0?19:-19,37);
      parts.push({d:p.d+10,draw(){c.beginPath();for(let j=0;j<10;j++){const a=j*Math.PI/5-Math.PI/2,r=j%2?3.7:8,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle='#ffdf85';c.fill();c.strokeStyle='#9d6426';c.lineWidth=1;c.stroke();}});
    }
    parts.sort((a,b)=>a.d-b.d).forEach(p=>p.draw());
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
  window.home3D={active:true,mode:'2d-oblique-side',setBadge(b){showBadge=!!b;},getYaw:()=>target,setYaw,getPitch:()=>0,getFrameCount:()=>frameCount,attachPreview};
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
