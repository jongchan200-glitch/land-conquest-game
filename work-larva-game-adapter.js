/* Work original larva 8-section renderer adapter · opt-in only ?larva=1
 * This file contains NO substitute body art. Both body and head are from
 * character-production/larva-stage-1/work-larva-renderer.js.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('larva')!=='1')return;
const old=window.landTopWorm;
if(!old||typeof window.createWorkLarva!=='function')return;
let actor;
try{actor=window.createWorkLarva(document.getElementById('scene'));}
catch(e){console.warn('Work larva unavailable, original preserved',e);return;}
const BASE=146, VISUAL=.53;
function drawActor(){
 if(!player||!state)return;
 const p=mapPosition(),scale=VISUAL*larvaLevelSize();
 if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 let angle=Number.isFinite(player.turnAngle)?player.turnAngle:Math.atan2(player.dirY||0,player.dirX||1);
 // The body path dictates head direction while cutting; match the physics.
 const realPath=bodyLine?.length>0?bodyLine:(bodyJoin?.line||[]);
 if(realPath.length>2){
   const end=realPath[realPath.length-1],rear=realPath[Math.max(0,realPath.length-6)];
   if(Math.hypot(end.x-rear.x,end.y-rear.y)>.04)angle=Math.atan2(end.y-rear.y,end.x-rear.x);
 }
 const forward={x:Math.cos(angle),y:Math.sin(angle)};
 let worldPoints=[];
 if(realPath.length&&bodyAnchor){
   worldPoints=realPath.map(v=>({x:v.x*T,y:v.y*T}));
 }else if(realPath.length>1){
   worldPoints=realPath.map(v=>({x:v.x*T,y:v.y*T}));
 }
 if(!worldPoints.length)worldPoints=[{x:p.x,y:p.y}];
 // The resting tail is always drawn and never replaced by the zero-length
 // start-of-cut trace. The same eight Work meshes stretch over the full line.
 const anchor=worldPoints[0];
 let firstDir=forward;
 for(let k=1;k<worldPoints.length;k++){
  const delta={x:worldPoints[k].x-anchor.x,y:worldPoints[k].y-anchor.y};
  const len=Math.hypot(delta.x,delta.y);
  if(len>2){firstDir={x:delta.x/len,y:delta.y/len};break;}
 }
 const start={x:anchor.x-firstDir.x*BASE*scale,y:anchor.y-firstDir.y*BASE*scale};
 const entire=[start,...worldPoints];
 const tip=entire[entire.length-1];
 if(Math.hypot(tip.x-p.x,tip.y-p.y)>.4)entire.push({x:p.x,y:p.y});
 // World coordinates -> Work's horizontal canonical pose, head facing -X.
 const cs=Math.cos(angle),sn=Math.sin(angle);
 const line=entire.map(v=>{const dx=v.x-p.x,dy=v.y-p.y;return {x:-(dx*cs+dy*sn)/scale,y:(dx*sn-dy*cs)/scale};});
 const gulpDuration=Math.max(.26,.64-(state.upgrades?.digest||0)*.073);
 const gulp=digest>0?Math.max(0,Math.min(1,1-digest/gulpDuration)):0;
 const lift=digest>0?Math.sin(gulp*Math.PI):0;
 const boluses=(gutBoluses||[]).filter(g=>g.time>=0&&g.time<g.duration).map(g=>Math.max(0,Math.min(1,g.time/g.duration)));
 try{
   ctx.save();
   ctx.translate(p.x,p.y);
   ctx.rotate(angle+Math.PI);
   ctx.scale(scale,scale);
   actor.draw({
     line,time:clock||0,direction:1,
     fullness:Math.max(0,Math.min(1,(state.fullness||0)/Math.max(1,biteMax()))),
     bite:typeof biteVisual==='function'?biteVisual():0,
     lift,boluses,gas:-1
   });
 }catch(e){
   if(!window.__workLarvaError){window.__workLarvaError=true;console.error('Work larva preview rendering failed',e);}
 }finally{ctx.restore();}
}
window.landTopWorm={...old,body:drawActor,player:()=>{},revision:'v0.2.32-real-work-8mesh'};
window.workLarvaDebug={active:true,segments:actor.segmentCount,source:'character-production/larva-stage-1/work-larva-renderer.js'};
const badge=document.createElement('a');
badge.href=location.pathname+'?'+[...new URLSearchParams(location.search)].filter(([k])=>k!=='larva').map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
badge.textContent='Work 애벌레 테스트 · 원래대로';
Object.assign(badge.style,{position:'fixed',right:'8px',bottom:'calc(env(safe-area-inset-bottom) + 145px)',zIndex:8,color:'#fff0cc',background:'rgba(6,28,32,.9)',padding:'7px 9px',borderRadius:'9px',font:'700 10px system-ui',textDecoration:'none',border:'1px solid #d2bf91'});
document.body.append(badge);
})();