/* True volumetric WebGL caterpillar lobby viewer.
 * Independent of gameplay: does not mutate approved sprite atlas or any save data.
 * Geometry is actual 3D, not a rotated image/billboard. */
(function(){
  'use strict';
  let canvas=document.getElementById('homeModelCanvas');
  if(!canvas)return;
  let gl;
  try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,depth:true,preserveDrawingBuffer:true});}catch(e){}
  let software=!gl;
  let prog;
  if(gl){
  const vs=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;
    uniform mat4 uProj;uniform float uYaw,uPitch,uBob;
    varying vec3 vN,vColor,vEye;
    void main(){
      float c=cos(uYaw),s=sin(uYaw),cp=cos(uPitch),sp=sin(uPitch);
      vec3 p=vec3(c*aPos.x+s*aPos.z,aPos.y,-s*aPos.x+c*aPos.z);
      p=vec3(p.x,cp*(p.y-.93)-sp*p.z,sp*(p.y-.93)+cp*p.z);
      vec3 n=vec3(c*aNormal.x+s*aNormal.z,aNormal.y,-s*aNormal.x+c*aNormal.z);
      n=vec3(n.x,cp*n.y-sp*n.z,sp*n.y+cp*n.z);
      p.y+=uBob;
      vec3 view=vec3(p.x+sin(uYaw)*.48,p.y,p.z-4.65);
      gl_Position=uProj*vec4(view,1.0);
      vN=normalize(n);vColor=aColor;vEye=-view;
    }`;
  const fs=`precision mediump float;varying vec3 vN,vColor,vEye;
    void main(){
      vec3 n=normalize(vN),L=normalize(vec3(-.52,.84,1.15)),v=normalize(vEye);
      float light=max(0.,dot(n,L)),fill=max(0.,dot(n,normalize(vec3(.80,.10,.45))));
      float rim=pow(1.-max(0.,dot(n,v)),3.0);
      float highlight=pow(max(0.,dot(reflect(-L,n),v)),25.0)*.25;
      vec3 col=vColor*(.64+.34*light+.10*fill)+vec3(.95,.76,.57)*highlight+vec3(.28,.20,.14)*rim*.13;
      gl_FragColor=vec4(col,1.0);
    }`;
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}

  try{prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));}
  catch(e){console.warn('WebGL fallback to software 3D',e);gl=null;software=true;const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;}
  if(gl){gl.useProgram(prog);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}

  }
  const v=[],parts=[];let badgeOffset=0, badgeCount=0;
  const palette={skin:[1,.766,.55],front:[1,.808,.630],cheek:[1,.700,.59],body:[.975,.754,.538],fold:[.894,.631,.448],white:[1,.992,.960],iris:[.35,.18,.12],pupil:[.071,.044,.046],mouth:[.29,.123,.102],lip:[.81,.434,.303],gold:[1,.796,.388],stem:[.765,.412,.225]};
  function vert(p,n,c){v.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2])}
  function sphere(cx,cy,cz,rx,ry,rz,col,lat=15,lon=22){
    parts.push({type:"sphere",cx,cy,cz,rx,ry,rz,col});
    function point(t,p){let st=Math.sin(t),ct=Math.cos(t),co=Math.cos(p),si=Math.sin(p);const q=[st*co,ct,st*si];return [[cx+q[0]*rx,cy+q[1]*ry,cz+q[2]*rz],[q[0]/rx,q[1]/ry,q[2]/rz]]}
    for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
      const t0=Math.PI*y/lat,t1=Math.PI*(y+1)/lat,p0=x*2*Math.PI/lon,p1=(x+1)*2*Math.PI/lon;
      const a=point(t0,p0),b=point(t1,p0),c=point(t0,p1),d=point(t1,p1);
      for(const q of [a,b,c,b,d,c])vert(q[0],q[1],col);
    }
  }
  function tube(points,r,color){
    parts.push({type:"tube",points,r,col:color});
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1];let t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const len=Math.hypot(...t)||1;t=t.map(x=>x/len);
      let u=[t[1],-t[0],0],un=Math.hypot(...u);if(un<.1){u=[0,t[2],-t[1]];un=Math.hypot(...u)}u=u.map(x=>x/un);
      let w=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
      const sides=10;
      function ring(center,j){const th=j*2*Math.PI/sides,n=u.map((val,k)=>val*Math.cos(th)+w[k]*Math.sin(th));return [center.map((val,k)=>val+n[k]*r),n]}
      for(let j=0;j<sides;j++){
        const p=ring(a,j),q=ring(b,j),o=ring(a,j+1),z=ring(b,j+1);
        for(const k of [p,q,o,q,z,o])vert(k[0],k[1],color);
      }
    }
  }
  // All the parts are closed meshes. The back and underside remain volumetric
  // through a full 360-degree orbit (no paper-thin image transformation).
  sphere(0,.48,-1.48,.32,.32,.37,palette.body);
  sphere(0,.47,-1.02,.46,.39,.48,palette.fold);
  sphere(0,.50,-.79,.58,.46,.62,palette.body);
  sphere(0,.50,-.33,.73,.53,.70,palette.fold);
  sphere(0,.52,-.24,.76,.54,.70,palette.front);
  sphere(0,.84,.52,.78,.84,.77,palette.skin,22,32);
  // Gentle cheeks, matching the approved peach/cream artwork.
  sphere(-.55,.52,1.13,.145,.116,.035,palette.cheek);
  sphere(.55,.52,1.13,.145,.116,.035,palette.cheek);
  // Large pearly eyes with pupils that have their own curvature from all angles.
  for(const sign of [-1,1]){
    sphere(sign*.31,1.20,1.033,.253,.298,.109,palette.lip);
    sphere(sign*.31,1.216,1.057,.246,.286,.108,palette.white,18,24);
    sphere(sign*.31,1.170,1.167,.110,.136,.051,palette.iris);
    sphere(sign*.31,1.170,1.210,.076,.107,.034,palette.pupil);
    sphere(sign*.295,1.231,1.234,.037,.042,.016,palette.white);
  }
  // Signature: TWO subtle, round whisker outlines circling the mouth.
  // These are 3D raised rings, not a painted smile or a flattened billboard.
  // Keep the inner mouth SMALL/CLOSED at rest; the ring belongs to the character.
  sphere(0,.47,1.206,.245,.252,.075,palette.front,20,30);
  const whiskerRing=(rx,ry,z,r,color)=>{
    const points=[];
    for(let k=0;k<=40;k++){
      const t=k*Math.PI*2/40;
      points.push([Math.sin(t)*rx,.475+Math.cos(t)*ry,z+.027*Math.cos(t)]);
    }
    tube(points,r,color);
  };
  whiskerRing(.235,.235,1.309,.012,palette.mouth);
  // Two tiny corners and a relaxed, closed smile within the round whisker.
  tube([[-.090,.464,1.350],[-.046,.451,1.354],[0,.441,1.356],[.046,.451,1.354],[.090,.464,1.350]],.012,palette.mouth);
  // A curved antenna with a rounded bulb rather than an endlessly flat icon.
  tube([[.02,1.74,.46],[.04,1.86,.49],[.15,2.04,.52],[.26,2.09,.54]],.056,palette.stem);
  sphere(.29,2.09,.54,.147,.143,.145,palette.gold);
  // Small visible side feet under the body.
  for(const z of [-.54,-1.05])for(const sign of [-1,1])sphere(sign*.53,.13,z,.23,.13,.21,palette.front,11,16);
  // Future equipment preview: detachable 3D badge (not fake-paid).
  badgeOffset=v.length/9;
  sphere(.70,.68,-.42,.105,.18,.20,palette.gold);
  sphere(.783,.69,-.42,.059,.115,.127,palette.white);
  badgeCount=v.length/9-badgeOffset;
  let uProj,uYaw,uPitch,uBob;
  if(gl){
  const buff=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buff);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
  const stride=9*4;
  function attrib(name,size,offset){const loc=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset)}
  attrib('aPos',3,0);attrib('aNormal',3,3*4);attrib('aColor',3,6*4);
  uProj=gl.getUniformLocation(prog,'uProj');uYaw=gl.getUniformLocation(prog,'uYaw');uPitch=gl.getUniformLocation(prog,'uPitch');uBob=gl.getUniformLocation(prog,'uBob');
  }
  const cpu=software?canvas.getContext('2d',{alpha:true}):null;
  let yaw=-0.68,pitch=0.035,dragged=false,dragID=null,lastX=0,lastY=0,velocity=0,dirty=true,showBadge=false,frameCount=0;
  let lastT=0;
  const model={active:true,setBadge(b){showBadge=!!b},getYaw:()=>yaw,setYaw(a){yaw=a;velocity=0},getPitch:()=>pitch,getFrameCount:()=>frameCount};
  window.home3D=model;
  function resize(){const w=Math.max(1,Math.round(canvas.clientWidth)),h=Math.max(1,Math.round(canvas.clientHeight)),dpr=Math.min(1.6,devicePixelRatio||1);const W=Math.round(w*dpr),H=Math.round(h*dpr);if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;if(gl)gl.viewport(0,0,W,H)}}
  function projection(aspect){const f=1/Math.tan(42*Math.PI/360),near=.1,far=80;return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)/(near-far),-1, 0,0,(2*far*near)/(near-far),0])}
  function draw(t){requestAnimationFrame(draw);if(document.hidden||!window.__homeIsOpen)return;resize();const dt=Math.min(.05,Math.max(0,(t-lastT)/1000));lastT=t;
    if(!dragged){yaw+=velocity*dt;velocity*=Math.pow(.05,dt);if(Math.abs(velocity)<.006)velocity=0; if(Math.abs(velocity)<.01)yaw+=dt*.055;}
    if(gl){
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uProj,false,projection(canvas.width/canvas.height));gl.uniform1f(uYaw,yaw);gl.uniform1f(uPitch,pitch);gl.uniform1f(uBob,Math.sin(t*.0016)*.026);
      gl.drawArrays(gl.TRIANGLES,0,badgeOffset);if(showBadge)gl.drawArrays(gl.TRIANGLES,badgeOffset,badgeCount);
    }else softwareDraw(t);
    frameCount++;
  }
  // Native canvas fallback: still turns actual 3D ellipsoids in depth,
  // unlike the old flat image that collapsed to a sheet when rotated.
  function softwareDraw(t){
    const w=canvas.width,h=canvas.height,c=cpu; if(!c)return;
    c.clearRect(0,0,w,h);
    const d=Math.min(w/4.1,h/3.15),centerX=w/2-Math.sin(yaw)*d*.15,centerY=h*.51;
    const sn=Math.sin(yaw),co=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
    function rotate(x,y,z){let xx=co*x+sn*z,zz=-sn*x+co*z,yy=y-.93;return [xx,cp*yy-sp*zz,sp*yy+cp*zz]}
    function proj(x,y,z){let k=(4.65/(4.65-z)),q=d*k;return [centerX+x*q,centerY-y*q+Math.sin(t*.0016)*d*.018,q]}
    function partZ(p){if(p.type==='sphere')return rotate(p.cx,p.cy,p.cz)[2];return p.points.reduce((sum,q)=>sum+rotate(...q)[2],0)/p.points.length}
    const visible=parts.filter((p,i)=>showBadge||i<parts.length-2).map(p=>({p,z:partZ(p)})).sort((a,b)=>a.z-b.z);
    function col(c,a=1){return 'rgba('+c.map(x=>Math.round(x*255)).join(',')+','+a+')'}
    for(const {p} of visible){
      if(p.type==='sphere'){
        const pos=rotate(p.cx,p.cy,p.cz),[px,py,sz]=proj(...pos);
        const rx=Math.sqrt((p.rx*co)**2+(p.rz*sn)**2)*sz;
        const ry=Math.sqrt((p.ry*cp)**2+((p.rx*sn+p.rz*co)*sp)**2)*sz;
        if(rx<=0||ry<=0)continue;
        c.save();c.beginPath();c.ellipse(px,py,rx,ry,0,0,Math.PI*2);c.clip();
        const g=c.createRadialGradient(px-rx*.36,py-ry*.43,ry*.02,px+rx*.07,py+ry*.12,Math.max(rx,ry)*1.18);
        g.addColorStop(0,col(p.col.map(x=>Math.min(1,x*1.17))));g.addColorStop(.5,col(p.col));g.addColorStop(1,col(p.col.map(x=>x*.64)));
        c.fillStyle=g;c.fillRect(px-rx,py-ry,rx*2,ry*2);c.restore();
      }else{
        const pts=p.points.map(q=>proj(...rotate(...q)));
        c.beginPath();c.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(q=>c.lineTo(q[0],q[1]));
        c.lineWidth=p.r*2*pts[Math.floor(pts.length/2)][2];c.strokeStyle=col(p.col);c.lineCap='round';c.lineJoin='round';c.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
  canvas.addEventListener('pointerdown',e=>{dragged=true;dragID=e.pointerId;lastX=e.clientX;lastY=e.clientY;velocity=0;canvas.setPointerCapture(e.pointerId);e.preventDefault()});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==dragID||!dragged)return;const dx=e.clientX-lastX;lastX=e.clientX;lastY=e.clientY;yaw+=dx*.0125;/* horizontal 360° only: vertical swipe does not tilt the character */velocity=Math.max(-3.4,Math.min(3.4,dx*.045));e.preventDefault()});
  function end(e){if(e.pointerId!==dragID)return;dragged=false;dragID=null}
  for(const n of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(n,end);
  canvas.addEventListener('keydown',e=>{if(e.code==='ArrowLeft'||e.code==='ArrowRight'){yaw+=(e.code==='ArrowLeft'?-1:1)*.22;velocity=0;e.preventDefault()}});
  canvas.setAttribute('tabindex','0');
})();
