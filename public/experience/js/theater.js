(function(){
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const stage=$('#stage'), hall=$('#hall');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mo=reduce?.2:1;
let started=false, D=.8, visible=true, showing=false;

const FX=[
 {id:'rain',label:'Rain',key:'1',mode:'hold'},
 {id:'snow',label:'Snow',key:'2',mode:'hold'},
 {id:'wind',label:'Wind',key:'3',mode:'hold'},
 {id:'fog',label:'Fog',key:'4',mode:'hold'},
 {id:'lightning',label:'Lightning',key:'5',mode:'burst',dur:1400},
 {id:'air',label:'Air blast',key:'6',mode:'burst',dur:1100},
 {id:'bubbles',label:'Bubbles',key:'7',mode:'hold'},
 {id:'fire',label:'Fire',key:'8',mode:'hold'}
];
const FXMAP={}; FX.forEach(f=>FXMAP[f.id]=f);
const on={}, lvl={}; FX.forEach(f=>{on[f.id]=false;lvl[f.id]=0;});
const S={flash:0,sx:0,sy:0,push:0,shake:0,seatOff:0,seatBack:0};

const ICON={
 rain:'<path d="M7 5c1.2 2 2.2 3.3 2.2 4.6a2.2 2.2 0 0 1-4.4 0C4.8 8.3 5.8 7 7 5z"/><path d="M16 3.5c1.2 2 2.2 3.3 2.2 4.6a2.2 2.2 0 0 1-4.4 0c0-1.3 1-2.6 2.2-4.6z"/><path d="M11.5 13c1.4 2.3 2.5 3.8 2.5 5.3a2.5 2.5 0 0 1-5 0c0-1.5 1.1-3 2.5-5.3z"/>',
 snow:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"/>',
 wind:'<path d="M3 9h10.5a2.5 2.5 0 1 0-2.4-3.1"/><path d="M3 13h15a2.8 2.8 0 1 1-2.6 3.8"/><path d="M3 17h6"/>',
 fog:'<path d="M7 15a4 4 0 0 1 .6-7.9 5 5 0 0 1 9.5 1.4A3.3 3.3 0 0 1 17 15z"/><path d="M4 18.5h10M8 21h11"/>',
 lightning:'<path d="M13 2.5L5 13.5h6l-1 8 8-11.5h-6z"/>',
 air:'<circle cx="7" cy="12" r="1.6"/><path d="M11 8.5a5 5 0 0 1 0 7M14.5 6a8.5 8.5 0 0 1 0 12M18 3.5a12 12 0 0 1 0 17"/>',
 bubbles:'<circle cx="9" cy="14" r="5"/><circle cx="17.5" cy="7" r="3"/><circle cx="18" cy="17.5" r="1.6"/><path d="M6.5 12.5a3 3 0 0 1 2-1.6"/>',
 fire:'<path d="M12 2.8c.8 3.1 5.4 5.2 5.4 10.4a5.4 5.4 0 0 1-10.8 0c0-2.2 1-3.6 2.3-4.8.2 1.9 1 2.9 2.2 3.2-.6-3 .1-6 .9-8.8z"/>'
};

/* ---------- Sound (all synthesized) ---------- */
const Snd=(()=>{
  let ctx=null,master=null,nbuf=null,muted=false,pad=null;
  const holds={};
  const sc=()=>.45+.55*((D-.35)/.65);
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function init(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try{
      ctx=new AC(); master=ctx.createGain(); master.gain.value=muted?.0001:.85; master.connect(ctx.destination);
      const n=ctx.sampleRate*2; nbuf=ctx.createBuffer(1,n,ctx.sampleRate); const d=nbuf.getChannelData(0);
      for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
    }catch(e){ctx=null;}
  }
  function resume(){ if(ctx&&ctx.state==='suspended') ctx.resume().catch(()=>{}); }
  function noiseSrc(){ const s=ctx.createBufferSource(); s.buffer=nbuf; s.loop=true; return s; }
  function shot(type,f0,f1,peak,a,d,q,when){
    if(!ctx) return; const t=ctx.currentTime+(when||0), s=noiseSrc(), f=ctx.createBiquadFilter(), g=ctx.createGain();
    f.type=type; f.frequency.setValueAtTime(f0,t); if(f1) f.frequency.exponentialRampToValueAtTime(f1,t+a+d); if(q) f.Q.value=q;
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak*sc()),t+a); g.gain.exponentialRampToValueAtTime(.0001,t+a+d);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+a+d+.05);
  }
  function tone(type,f0,f1,peak,a,d,when){
    if(!ctx) return; const t=ctx.currentTime+(when||0), o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(f0,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+a+d);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak*sc()),t+a); g.gain.exponentialRampToValueAtTime(.0001,t+a+d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+a+d+.05);
  }
  function loop(fn,a,b){ let alive=true,h; const tick=()=>{ if(!alive) return; fn(); h=setTimeout(tick,rnd(a,b)); }; tick(); return ()=>{alive=false;clearTimeout(h);}; }
  function filt(type,f,q){ const x=ctx.createBiquadFilter(); x.type=type; x.frequency.value=f; if(q) x.Q.value=q; return x; }

  function setHold(id,v){
    if(!ctx) return;
    if(!v){
      const h=holds[id]; if(!h) return; delete holds[id];
      h.g.gain.cancelScheduledValues(ctx.currentTime); h.g.gain.setTargetAtTime(.0001,ctx.currentTime,.25);
      h.stops.forEach(f=>f()); setTimeout(()=>{h.nodes.forEach(n=>{try{n.stop()}catch(e){}});},1800); return;
    }
    if(holds[id]) return;
    const g=ctx.createGain(); g.gain.value=.0001; g.connect(master);
    const nodes=[], stops=[]; let peak=.2;
    const nz=(f)=>{ const s=noiseSrc(); s.connect(f); s.start(); nodes.push(s); return s; };
    if(id==='rain'){ const bp=filt('bandpass',3800,.45), hp=filt('highpass',900); nz(bp); bp.connect(hp); hp.connect(g);
      const lp=filt('lowpass',500), g2=ctx.createGain(); g2.gain.value=.25; nz(lp); lp.connect(g2); g2.connect(g); peak=.22; }
    else if(id==='wind'){ const bp=filt('bandpass',600,1.1); nz(bp); bp.connect(g);
      const lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=.17; lg.gain.value=380; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(); nodes.push(lfo); peak=.3; }
    else if(id==='fog'){ [55,55.8,82.4].forEach((f,i)=>{ const o=ctx.createOscillator(), og=ctx.createGain(); o.frequency.value=f; og.gain.value=i===2?.3:.6; o.connect(og); og.connect(g); o.start(); nodes.push(o); });
      const lp=filt('lowpass',220), g2=ctx.createGain(); g2.gain.value=.3; nz(lp); lp.connect(g2); g2.connect(g); peak=.12; }
    else if(id==='snow'){ const lp=filt('lowpass',700), g2=ctx.createGain(); g2.gain.value=.25; nz(lp); lp.connect(g2); g2.connect(g); peak=.06;
      const P=[1046.5,1174.7,1318.5,1568,1760];
      stops.push(loop(()=>{const f=P[Math.floor(Math.random()*P.length)]; tone('sine',f,null,.05,.01,1.6); tone('sine',f*2.01,null,.02,.01,1)},900,2400)); }
    else if(id==='bubbles'){ peak=.0001; stops.push(loop(()=>{const f=rnd(260,640); tone('sine',f,f*2.4,.09,.005,.09)},110,360)); }
    else if(id==='fire'){ const lp=filt('lowpass',380); nz(lp); lp.connect(g); peak=.26;
      stops.push(loop(()=>shot('highpass',2200,null,.12,.002,.03),40,200)); }
    if(peak>.001) g.gain.setTargetAtTime(peak*sc(),ctx.currentTime,.4);
    holds[id]={g,nodes,stops};
  }
  function burst(id){
    if(!ctx) return;
    if(id==='lightning'){ shot('highpass',1500,null,.55,.002,.14); shot('lowpass',500,80,.95,.08,3,.7,.45); }
    else if(id==='air'){ shot('bandpass',300,2400,.6,.25,.4,1); shot('bandpass',2400,400,.4,.01,.5,1,.35); }
  }
  function whoosh(){ shot('bandpass',200,1200,.3,.5,.9,.9); }
  function score(){
    if(!ctx||pad) return; pad=ctx.createGain(); pad.gain.value=.0001; pad.connect(master);
    const lp=filt('lowpass',800); lp.connect(pad);
    const lfo=ctx.createOscillator(), lg=ctx.createGain(); lfo.frequency.value=.08; lg.gain.value=300; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    [110,164.81,196,246.94,329.63].forEach((f,i)=>{ const o=ctx.createOscillator(); o.type='triangle'; o.frequency.value=f; o.detune.value=(i%2?4:-4); o.connect(lp); o.start(); });
    pad.gain.setTargetAtTime(.06,ctx.currentTime,2);
  }
  function mute(m){ muted=m; if(ctx) master.gain.setTargetAtTime(m?.0001:.85,ctx.currentTime,.05); }
  return {init,resume,hold:setHold,burst,whoosh,score,mute,get ready(){return !!ctx;}};
})();

/* ---------- 3D film scene ---------- */
function initGL(){
  const T=window.THREE; if(!T) throw new Error('three missing');
  const canvas=$('#gl');
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,innerWidth<700?1.5:2));
  renderer.setClearColor(0x050407);
  const scene=new T.Scene(); scene.fog=new T.Fog(0x2b1744,30,150);
  const cam=new T.PerspectiveCamera(44,1.6,.1,400);
  const HW=6, HH=3.375, R=Math.random;
  const hemi=new T.HemisphereLight(0xffc9a0,0x2a1a55,.9); scene.add(hemi);
  const sun=new T.DirectionalLight(0xffa860,1.5); sun.position.set(-6,5,-10); scene.add(sun);
  const fill=new T.DirectionalLight(0x9fb8ff,.95); fill.position.set(3,4,14); scene.add(fill);
  const fireL=new T.PointLight(0xff7a2a,0,24); scene.add(fireL);

  function ctex(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return new T.CanvasTexture(c); }
  const dot=ctex(64,64,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.35,'rgba(255,255,255,.55)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });

  /* sky */
  const skyTex=ctex(8,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h);
    [[0,'#0a0720'],[.3,'#1e1050'],[.5,'#5a2470'],[.68,'#c0505a'],[.8,'#ff9d5c'],[.92,'#ffd08a'],[1,'#ffe9bf']].forEach(s=>gr.addColorStop(s[0],s[1])); g.fillStyle=gr; g.fillRect(0,0,w,h); });
  const sky=new T.Mesh(new T.PlaneGeometry(320,70),new T.MeshBasicMaterial({map:skyTex,fog:false})); sky.position.set(0,0,-85); scene.add(sky);
  const sp=new Float32Array(300*3); for(let i=0;i<300;i++){ sp[i*3]=(R()-.5)*220; sp[i*3+1]=4+R()*30; sp[i*3+2]=-84; }
  const sg=new T.BufferGeometry(); sg.setAttribute('position',new T.BufferAttribute(sp,3));
  scene.add(new T.Points(sg,new T.PointsMaterial({size:.5,map:dot,color:0xffffff,fog:false,transparent:true,opacity:.85,depthWrite:false})));
  const moon=new T.Mesh(new T.SphereGeometry(7,32,24),new T.MeshBasicMaterial({color:0xfff0d6,fog:false})); moon.position.set(-24,9,-78); scene.add(moon);
  const mg=new T.Sprite(new T.SpriteMaterial({map:dot,color:0xffe2b0,opacity:.5,blending:T.AdditiveBlending,depthWrite:false,fog:false})); mg.scale.set(44,44,1); mg.position.copy(moon.position); mg.position.z+=1; scene.add(mg);

  /* islands */
  const topM=new T.MeshStandardMaterial({color:0x3b7a5e,flatShading:true,roughness:.9});
  const rockM=new T.MeshStandardMaterial({color:0x3a2c48,flatShading:true,roughness:.95});
  const islands=[];
  [[-16,3,-30,3.2],[17,-2,-34,4],[-24,-5,-48,5.5],[26,6,-52,5],[-10,-7,-22,2],[11,8,-26,2.4],[0,-9,-60,6],[-36,8,-66,7],[36,-6,-70,7]].forEach((d,i)=>{
    const g=new T.Group(), r=d[3];
    const top=new T.Mesh(new T.IcosahedronGeometry(r,1),topM); top.scale.set(1,.42,1);
    const bot=new T.Mesh(new T.ConeGeometry(r*.85,r*1.5,7,1),rockM); bot.rotation.x=Math.PI; bot.position.y=-r*.75;
    g.add(top,bot); g.position.set(d[0],d[1],d[2]); g.rotation.y=R()*6; scene.add(g); islands.push({g,y:d[1],ph:i*1.7});
  });
  /* clouds */
  const clouds=[]; for(let i=0;i<14;i++){
    const s=new T.Sprite(new T.SpriteMaterial({map:dot,color:i%2?0x9a5aa8:0xd0708a,opacity:.2,depthWrite:false,fog:false}));
    const sz=30+R()*24; s.scale.set(sz*1.8,sz*.6,1); s.position.set((R()-.5)*120,-20+R()*28,-38-R()*38); scene.add(s); clouds.push(s);
  }
  /* motes */
  const MN=320, mp=new Float32Array(MN*3); for(let i=0;i<MN;i++){ mp[i*3]=(R()-.5)*90; mp[i*3+1]=(R()-.5)*44; mp[i*3+2]=-70+R()*75; }
  const mgeo=new T.BufferGeometry(); mgeo.setAttribute('position',new T.BufferAttribute(mp,3));
  scene.add(new T.Points(mgeo,new T.PointsMaterial({size:.22,map:dot,color:0xffc880,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,fog:false})));

  /* screen frame: a dark wall with a window, so anything at z>0 pops out of it */
  function rect(w,h){ const s=new T.Shape(); s.moveTo(-w,-h); s.lineTo(w,-h); s.lineTo(w,h); s.lineTo(-w,h); s.lineTo(-w,-h); return s; }
  function hole(w,h){ const p=new T.Path(); p.moveTo(-w,-h); p.lineTo(-w,h); p.lineTo(w,h); p.lineTo(w,-h); p.lineTo(-w,-h); return p; }
  const wall=rect(70,45); wall.holes.push(hole(HW+.1,HH+.1));
  scene.add(new T.Mesh(new T.ShapeGeometry(wall),new T.MeshBasicMaterial({color:0x07060a,fog:false,side:T.DoubleSide})));
  const bez=rect(HW+.1,HH+.1); bez.holes.push(hole(HW,HH));
  scene.add(new T.Mesh(new T.ShapeGeometry(bez),new T.MeshBasicMaterial({color:0x2a2030,fog:false,side:T.DoubleSide})));
  const spill=ctex(256,256,(g,w,h)=>{ const r=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    r.addColorStop(0,'rgba(255,196,130,0)'); r.addColorStop(.3,'rgba(255,196,130,0)'); r.addColorStop(.37,'rgba(255,196,130,.2)'); r.addColorStop(.55,'rgba(255,170,100,.08)'); r.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
  const sl=new T.Mesh(new T.PlaneGeometry(34,21),new T.MeshBasicMaterial({map:spill,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false})); sl.position.z=.03; scene.add(sl);

  /* dragon */
  const N=30, SPACING=.46, SC=1.2, TP=22; let zPeak=4.6;
  const bodyM=new T.MeshStandardMaterial({color:0x1fae98,roughness:.5,metalness:.15,flatShading:true,emissive:0x08342d});
  const spikeM=new T.MeshStandardMaterial({color:0xffb347,roughness:.6,flatShading:true,emissive:0x5a3205});
  const wingM=new T.MeshStandardMaterial({color:0x2fd3b5,roughness:.6,flatShading:true,emissive:0x0d5a4c,side:T.DoubleSide,transparent:true,opacity:.92});
  const dragon=new T.Group(); scene.add(dragon);
  const sphereG=new T.SphereGeometry(1,14,10), coneG=new T.ConeGeometry(.2,.62,5);
  const segs=[];
  for(let i=0;i<N;i++){
    const g=new T.Group(), rad=(.62*Math.pow(1-i/N,.85)+.06)*SC;
    const b=new T.Mesh(sphereG,bodyM); b.scale.set(rad,rad*.92,rad*1.35); g.add(b);
    const k=new T.Mesh(coneG,spikeM); k.scale.setScalar(rad*1.4+.05); k.position.y=rad*.9; g.add(k);
    dragon.add(g); segs.push(g);
  }
  const head=new T.Group(); dragon.add(head);
  const hm=new T.Mesh(sphereG,bodyM); hm.scale.set(.62*SC,.55*SC,.85*SC); head.add(hm);
  const snout=new T.Mesh(new T.BoxGeometry(.5*SC,.32*SC,.7*SC),bodyM); snout.position.set(0,-.08*SC,.8*SC); head.add(snout);
  const eyeM=new T.MeshBasicMaterial({color:0xffc24d});
  [-1,1].forEach(s=>{ const e=new T.Mesh(sphereG,eyeM); e.scale.setScalar(.1*SC); e.position.set(s*.28*SC,.17*SC,.5*SC); head.add(e);
    const h=new T.Mesh(coneG,spikeM); h.scale.setScalar(.9*SC); h.position.set(s*.22*SC,.45*SC,-.1*SC); h.rotation.x=-1.1; head.add(h); });
  /* wings */
  const ws=new T.Shape(); [[0,0],[3.2,-.6],[4.6,.4],[3.4,1.2],[2.2,.6],[1.4,1.6],[0,1.2]].forEach((p,i)=>i?ws.lineTo(p[0],p[1]):ws.moveTo(p[0],p[1]));
  const wg=new T.ShapeGeometry(ws); wg.rotateX(-Math.PI/2);
  const wingRoot=new T.Group(); dragon.add(wingRoot);
  const pivots=[1,-1].map(s=>{ const outer=new T.Group(); outer.scale.x=s; const piv=new T.Group(); const m=new T.Mesh(wg,wingM); m.scale.setScalar(.85*SC); piv.add(m); outer.add(piv); wingRoot.add(outer); return piv; });

  const P=[]; for(let i=0;i<=N;i++) P.push(new T.Vector3());
  const A=new T.Vector3(), B=new T.Vector3(), F=new T.Vector3(), Rv=new T.Vector3(), U=new T.Vector3(), UP=new T.Vector3(0,1,0), M=new T.Matrix4();
  const headF=new T.Vector3(0,0,1);
  function pathAt(tt,o){ const u=tt/TP*Math.PI*2, s=.5-.5*Math.cos(u), e=Math.pow(s,1.15);
    return o.set(4.4*Math.sin(2*u+.6)*(1-.4*e), 1.1*Math.sin(3*u+1)+.5*e-.3, -26+(26+zPeak)*e); }
  function layout(t){
    pathAt(t,P[0]); A.copy(P[0]); let idx=1, acc=0, target=SPACING;
    for(let k=1;k<900&&idx<=N;k++){ pathAt(t-k*.012,B); const seg=A.distanceTo(B);
      while(idx<=N&&seg>0&&acc+seg>=target){ P[idx].copy(A).lerp(B,(target-acc)/seg); idx++; target+=SPACING; }
      acc+=seg; A.copy(B); }
    for(;idx<=N;idx++) P[idx].copy(A);
  }
  function orient(o,i,out){
    F.subVectors(P[Math.max(i-1,0)],P[Math.min(i+1,N)]).normalize();
    Rv.crossVectors(UP,F); if(Rv.lengthSq()<1e-4) Rv.set(1,0,0); Rv.normalize(); U.crossVectors(F,Rv);
    M.makeBasis(Rv,U,F); o.quaternion.setFromRotationMatrix(M); if(out) out.copy(F);
  }
  /* fire breath */
  const BN=260, bPos=new Float32Array(BN*3), bCol=new Float32Array(BN*3), bVel=new Float32Array(BN*3), bLife=new Float32Array(BN).fill(-1), bMax=new Float32Array(BN);
  for(let i=0;i<BN;i++) bPos[i*3+2]=-999;
  const bGeo=new T.BufferGeometry(); bGeo.setAttribute('position',new T.BufferAttribute(bPos,3)); bGeo.setAttribute('color',new T.BufferAttribute(bCol,3));
  const breath=new T.Points(bGeo,new T.PointsMaterial({size:1.35,map:dot,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false})); breath.frustumCulled=false; scene.add(breath);
  let bAcc=0, bCur=0, prevZ=-26;

  let baseDist=11;
  const camT=new T.Vector3();
  function resize(w,h){
    renderer.setSize(w,h,false); cam.aspect=w/h;
    const need=Math.max(HH*1.38,HW*1.12/cam.aspect); baseDist=need/Math.tan(cam.fov*Math.PI/360); zPeak=Math.min(8.5,4.6+Math.max(0,baseDist-11)*.65); cam.updateProjectionMatrix();
  }
  function render(dt,t){
    /* camera: seat offset, gentle sway, shake, poke push */
    const sh=S.shake*mo;
    camT.set(S.seatOff*1.15+Math.sin(t*.37)*.14+(R()-.5)*sh*.5, .2+Math.sin(t*.51)*.07+(R()-.5)*sh*.5+(S.sy*-.004)*mo, baseDist+S.seatBack*.9-S.push*.4*mo);
    cam.position.lerp(camT,Math.min(1,dt*4)); cam.lookAt(0,0,0); cam.rotateZ(Math.sin(t*1.3)*.012*lvl.wind*mo+(R()-.5)*sh*.01);
    /* dragon */
    layout(t); head.position.copy(P[0]); orient(head,0,headF);
    for(let i=0;i<N;i++){ segs[i].position.copy(P[i+1]); orient(segs[i],i+1); }
    wingRoot.position.copy(P[4]); orient(wingRoot,4);
    const fl=Math.sin(t*5.5)*.6+.2; pivots[0].rotation.z=fl; pivots[1].rotation.z=fl;
    if(prevZ<0&&P[0].z>=0&&started) Snd.whoosh(); prevZ=P[0].z;
    /* breath */
    const fr=lvl.fire; let rate=fr>.3?120*fr*D:0; bAcc+=dt*rate;
    while(bAcc>=1){ bAcc-=1; let n=0; while(n<BN&&bLife[bCur]>=0){bCur=(bCur+1)%BN;n++;} if(n>=BN)break; const i=bCur;
      bPos[i*3]=head.position.x+headF.x*SC*1.1; bPos[i*3+1]=head.position.y+headF.y*SC*1.1-.1; bPos[i*3+2]=head.position.z+headF.z*SC*1.1;
      const sp=6+R()*4; bVel[i*3]=headF.x*sp+(R()-.5)*2.4; bVel[i*3+1]=headF.y*sp+(R()-.5)*2.4; bVel[i*3+2]=headF.z*sp+(R()-.5)*2.4; bLife[i]=0; bMax[i]=.6+R()*.7; }
    for(let i=0;i<BN;i++){ if(bLife[i]<0) continue; bLife[i]+=dt; const q=bLife[i]/bMax[i];
      if(q>=1){ bLife[i]=-1; bPos[i*3+2]=-999; bCol[i*3]=bCol[i*3+1]=bCol[i*3+2]=0; continue; }
      bPos[i*3]+=bVel[i*3]*dt; bPos[i*3+1]+=(bVel[i*3+1]+1.2)*dt; bPos[i*3+2]+=bVel[i*3+2]*dt;
      const a=1-q; bCol[i*3]=a; bCol[i*3+1]=.7*Math.pow(a,1.3)+.1*a; bCol[i*3+2]=.1*a*a; }
    bGeo.attributes.position.needsUpdate=true; bGeo.attributes.color.needsUpdate=true;
    fireL.position.set(head.position.x+headF.x*3,head.position.y+headF.y*3,head.position.z+headF.z*3); fireL.intensity=3*fr*(.85+.15*Math.sin(t*20));
    /* world */
    islands.forEach(o=>{ o.g.position.y=o.y+Math.sin(t*.5+o.ph)*.4; o.g.rotation.y+=dt*.03; });
    clouds.forEach((c,i)=>{ c.position.x+=dt*(.6+(i%3)*.3); if(c.position.x>80) c.position.x=-80; });
    for(let i=0;i<MN;i++){ mp[i*3+2]+=dt*2.2; if(mp[i*3+2]>6) mp[i*3+2]=-70; mp[i*3+1]+=Math.sin(t+i)*dt*.1; }
    mgeo.attributes.position.needsUpdate=true;
    scene.fog.far=150-lvl.fog*95; scene.fog.near=30-lvl.fog*24;
    hemi.intensity=.9+S.flash*2.4; sun.intensity=1.5+S.flash*2;
    renderer.render(scene,cam);
  }
  return {resize,render};
}

/* ---------- 2D effects layer ---------- */
const fxc=$('#fx'), c=fxc.getContext('2d'); let W=0,H=0;
const R=Math.random, TAU=Math.PI*2;
const rain=[],snow=[],wind=[],bubs=[],fogB=[],drops=[],embers=[];
let emberAcc=0;
const fogTex=document.createElement('canvas'); fogTex.width=fogTex.height=256;
(function(){ const g=fogTex.getContext('2d'), r=g.createRadialGradient(128,128,0,128,128,128); r.addColorStop(0,'rgba(215,208,230,.9)'); r.addColorStop(1,'rgba(215,208,230,0)'); g.fillStyle=r; g.fillRect(0,0,256,256); })();

const tong=[];
function seedFx(){
  rain.length=snow.length=wind.length=bubs.length=fogB.length=0;
  for(let i=0;i<320;i++) rain.push({x:R()*W*1.2-W*.1,y:R()*H,l:14+R()*26,v:620+R()*420});
  for(let i=0;i<200;i++) snow.push({x:R()*W,y:R()*H,r:1+R()*2.6,v:30+R()*50,ph:R()*TAU,sw:10+R()*25});
  for(let i=0;i<30;i++) wind.push({x:R()*W,y:R()*H,l:80+R()*220,v:900+R()*900,a:.1+R()*.25,w:.6+R()*1.2,b:R()*14});
  for(let i=0;i<36;i++) bubs.push({x:R()*W,y:R()*H,r:6+R()*20,v:30+R()*70,ph:R()*TAU,wob:8+R()*18});
  tong.length=0; const nt=Math.max(8,Math.ceil(W/(30+(innerWidth<700?8:0)))); for(let i=0;i<nt;i++) tong.push({x:(i+.5)*W/nt+(R()-.5)*8,ph:R()*TAU,w:(W/nt)*(1.6+R()*.9),hh:.55+R()*.6});
  for(let i=0;i<9;i++) fogB.push({x:R()*W,y:H*(.35+R()*.65),s:W*(.5+R()*.6),vx:(8+R()*14)*(R()>.5?1:-1),a:.5+R()*.5});
}
function sizeFx(){
  const dpr=Math.min(window.devicePixelRatio||1,innerWidth<700?1.5:2); W=stage.clientWidth; H=stage.clientHeight;
  fxc.width=Math.round(W*dpr); fxc.height=Math.round(H*dpr); c.setTransform(dpr,0,0,dpr,0,0); seedFx();
}

const bs={lightning:-1,air:-1};
const DUR={lightning:1.4,air:1.1};
let bolts=[];
function jag(x0,y0,x1,y1,n,amp){ const p=[[x0,y0]]; for(let i=1;i<=n;i++){ const f=i/n; p.push([x0+(x1-x0)*f+(i<n?(R()-.5)*amp:0),y0+(y1-y0)*f]); } return p; }
function genBolts(){
  bolts=[]; const x0=W*(.2+R()*.6), x1=x0+(R()-.5)*W*.25, y1=H*(.55+R()*.2), m=jag(x0,-10,x1,y1,16,H*.07); bolts.push({p:m,w:2.6});
  for(let b=0;b<3;b++){ const q=m[3+Math.floor(R()*(m.length-6))], d=R()<.5?-1:1; bolts.push({p:jag(q[0],q[1],q[0]+d*W*(.08+R()*.12),q[1]+H*(.15+R()*.2),8,H*.05),w:1.2}); }
}
const fxBurst={
  lightning(){ bs.lightning=0; genBolts(); S.shake=Math.max(S.shake,.25); },
  air(){ bs.air=0; S.shake=Math.max(S.shake,.35); }
};
function flashAt(t){ if(t<.06) return t/.06; if(t<.2) return 1-(t-.06)/.14*.75; if(t<.26) return .25+(t-.2)/.06*.75; return Math.max(0,1-(t-.26)/.5); }

const PAL=[[[255,150,40],[220,60,15]],[[255,205,85],[255,115,30]],[[255,250,215],[255,190,70]]];
function flame(x,base,w,h,ph,t,a,layer){
  const sway=Math.sin(t*3.1+ph)*w*.3+Math.sin(t*7.3+ph*2)*w*.12, hh=h*(.7+.3*Math.sin(t*9+ph*1.7)*Math.sin(t*4.1+ph)), tx=x+sway, p=PAL[layer];
  c.beginPath(); c.moveTo(x-w/2,base);
  c.bezierCurveTo(x-w*.6,base-hh*.38,x-w*.18+sway*.5,base-hh*.66,tx,base-hh);
  c.bezierCurveTo(x+w*.18+sway*.5,base-hh*.66,x+w*.6,base-hh*.38,x+w/2,base); c.closePath();
  const g=c.createLinearGradient(0,base,0,base-hh);
  g.addColorStop(0,`rgba(${p[0][0]},${p[0][1]},${p[0][2]},${.9*a})`); g.addColorStop(.45,`rgba(${p[1][0]},${p[1][1]},${p[1][2]},${.6*a})`); g.addColorStop(1,`rgba(${p[1][0]},${p[1][1]-40},10,0)`);
  c.fillStyle=g; c.fill();
}
function fxStep(dt,t){
  if(!W||!H) return;
  c.clearRect(0,0,W,H);
  const k=Math.max(.6,Math.min(1.4,H/640)); let sx=0,sy=0,push=0;
  /* fog */
  if(lvl.fog>.01){ fogB.forEach(b=>{ b.x+=b.vx*dt; if(b.x>W+b.s/2) b.x=-b.s/2; if(b.x<-b.s/2) b.x=W+b.s/2; c.globalAlpha=.36*b.a*lvl.fog*(.6+.4*D); c.drawImage(fogTex,b.x-b.s/2,b.y-b.s*.3,b.s,b.s*.6); }); c.globalAlpha=1; }
  /* rain */
  if(lvl.rain>.01){ const slant=.2+lvl.wind*.45, n=Math.floor(rain.length*D); c.strokeStyle=`rgba(185,210,255,${.4*Math.min(1,lvl.rain*1.6)})`; c.lineWidth=1; c.beginPath();
    for(let i=0;i<n;i++){ const p=rain[i]; p.y+=p.v*dt*k; p.x+=p.v*slant*dt*k; if(p.y>H+p.l){ p.y=-p.l*k; p.x=R()*W*1.2-W*.1; } c.moveTo(p.x,p.y); c.lineTo(p.x-p.l*k*slant,p.y-p.l*k); }
    c.stroke();
    if(on.rain&&drops.length<16&&R()<dt*3*D) drops.push({x:R()*W,y:R()*H*.8,r:(3+R()*6)*k,vy:0,life:0,max:3+R()*3});
  }
  for(let i=drops.length-1;i>=0;i--){ const p=drops[i]; p.life+=dt; if(p.life>.8) p.vy=Math.min(p.vy+dt*40,70); p.y+=p.vy*dt; if(p.life>p.max){drops.splice(i,1);continue;}
    const a=Math.min(1,p.life*2,(p.max-p.life)*1.5)*.5;
    c.beginPath(); c.arc(p.x,p.y,p.r,0,TAU); c.fillStyle=`rgba(200,225,255,${a*.12})`; c.fill(); c.strokeStyle=`rgba(220,238,255,${a*.6})`; c.lineWidth=1; c.stroke();
    c.beginPath(); c.arc(p.x-p.r*.3,p.y-p.r*.35,p.r*.28,0,TAU); c.fillStyle=`rgba(255,255,255,${a*.9})`; c.fill(); }
  /* snow */
  if(lvl.snow>.01){ const n=Math.floor(snow.length*D); c.fillStyle=`rgba(255,255,255,${.85*Math.min(1,lvl.snow*1.6)})`; c.beginPath();
    for(let i=0;i<n;i++){ const p=snow[i]; p.y+=p.v*dt*k; p.x+=Math.sin(t*.9+p.ph)*p.sw*dt+lvl.wind*60*dt; if(p.y>H+5){p.y=-5;p.x=R()*W;} if(p.x>W+5)p.x=-5; c.moveTo(p.x+p.r*k,p.y); c.arc(p.x,p.y,p.r*k,0,TAU); }
    c.fill(); }
  /* wind */
  if(lvl.wind>.01){ c.lineCap='round'; wind.forEach(p=>{ p.x+=p.v*dt*(.3+.7*lvl.wind); if(p.x-p.l>W){ p.x=-20; p.y=R()*H; }
      c.strokeStyle=`rgba(230,240,255,${p.a*lvl.wind})`; c.lineWidth=p.w; c.beginPath(); c.moveTo(p.x-p.l,p.y); c.quadraticCurveTo(p.x-p.l/2,p.y+p.b*Math.sin(t*2+p.y),p.x,p.y); c.stroke(); }); }
  /* bubbles */
  if(lvl.bubbles>.01){ const n=Math.floor(bubs.length*D), al=Math.min(1,lvl.bubbles*1.5);
    for(let i=0;i<n;i++){ const p=bubs[i]; p.y-=p.v*dt*k; p.x+=Math.sin(t*1.6+p.ph)*p.wob*dt; if(p.y<-p.r*2){p.y=H+p.r*2;p.x=R()*W;} const r=p.r*k;
      c.globalAlpha=al; c.beginPath(); c.arc(p.x,p.y,r,0,TAU); c.fillStyle='rgba(170,215,255,.07)'; c.fill(); c.strokeStyle='rgba(210,235,255,.65)'; c.lineWidth=1.2; c.stroke();
      c.beginPath(); c.arc(p.x,p.y,r*.7,-2.6,-1.7); c.strokeStyle='rgba(255,255,255,.8)'; c.lineWidth=1.5; c.stroke(); }
    c.globalAlpha=1; }
  /* fire: a wall of flame tongues along the bottom edge, lit embers, heat glow */
  if(lvl.fire>.01||embers.length){
    const f=lvl.fire, fl=.85+.15*Math.sin(t*23)*Math.sin(t*7.3), base=H+8*k;
    emberAcc+=dt*34*f*D; while(emberAcc>=1&&embers.length<90){ emberAcc-=1; embers.push({x:R()*W,y:H*(.9+R()*.1),vx:(R()-.5)*60,vy:-(60+R()*170)*k,l:0,m:1.2+R()*1.5}); } emberAcc=Math.min(emberAcc,2);
    c.globalCompositeOperation='lighter';
    if(f>.01){
      const gr=c.createLinearGradient(0,H,0,H*.3);
      gr.addColorStop(0,`rgba(255,110,30,${.5*f*fl})`); gr.addColorStop(.5,`rgba(255,70,20,${.14*f*fl})`); gr.addColorStop(1,'rgba(255,70,20,0)'); c.fillStyle=gr; c.fillRect(0,H*.3,W,H*.7);
      const hmax=H*(.3+.1*D)*Math.min(1,f*1.3), sc=[1.2,.82,.5], wm=[1.3,1,.7], al=[.6,.85,1];
      for(let ly=0;ly<3;ly++) for(let i=0;i<tong.length;i++){ const q=tong[i]; flame(q.x+Math.sin(t*1.7+q.ph+ly)*5,base,q.w*wm[ly],hmax*q.hh*sc[ly]*fl,q.ph+ly*1.3,t,f*al[ly]*(.8+.2*fl),ly); }
    }
    for(let i=embers.length-1;i>=0;i--){ const p=embers[i]; p.l+=dt; if(p.l>p.m){embers.splice(i,1);continue;} p.y+=p.vy*dt; p.x+=p.vx*dt+Math.sin(p.l*5+i)*20*dt; c.globalAlpha=(1-p.l/p.m)*Math.min(1,f*3+.3); c.fillStyle='rgba(255,205,120,1)'; c.fillRect(p.x,p.y,2*k,2*k); }
    c.globalAlpha=1; c.globalCompositeOperation='source-over';
  }
  /* lightning */
  let fl=0;
  if(bs.lightning>=0){ bs.lightning+=dt; const lt=bs.lightning; if(lt>DUR.lightning) bs.lightning=-1; else {
    fl=flashAt(lt);
    if(lt<.45){ const a=Math.min(1,(.45-lt)/.25); c.save(); c.lineCap='round'; c.lineJoin='round'; c.shadowColor='rgba(170,200,255,1)'; c.shadowBlur=18; c.strokeStyle=`rgba(240,246,255,${a})`;
      bolts.forEach(b=>{ c.lineWidth=b.w*k; c.beginPath(); b.p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); c.stroke(); }); c.restore(); } } }
  S.flash=fl;
  /* air blast */
  if(bs.air>=0){ bs.air+=dt; const p0=bs.air; if(p0>DUR.air) bs.air=-1; else { const ox=W/2, oy=H*.92;
    for(let j=0;j<3;j++){ const p=(p0-j*.12)/.9; if(p<0||p>1) continue; const r=p*W*.75; c.beginPath(); c.ellipse(ox,oy,r,r*.55,0,0,TAU); c.strokeStyle=`rgba(235,245,255,${(1-p)*.5})`; c.lineWidth=3*(1-p)+1; c.stroke(); }
    const p=Math.min(1,p0/.9); c.lineCap='round'; for(let i=0;i<28;i++){ const a=-Math.PI*(i+.5)/28, r0=p*W*.4, r1=r0+(60+(i%5)*30)*(1-p)*k; c.strokeStyle=`rgba(235,245,255,${(1-p)*.45})`; c.lineWidth=1.4; c.beginPath(); c.moveTo(ox+Math.cos(a)*r0,oy+Math.sin(a)*r0*.7); c.lineTo(ox+Math.cos(a)*r1,oy+Math.sin(a)*r1*.7); c.stroke(); }
    const g=c.createRadialGradient(ox,oy,0,ox,oy,W*.5); g.addColorStop(0,`rgba(225,238,255,${(1-p)*.2})`); g.addColorStop(1,'rgba(225,238,255,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); } }
  /* flash overlay */
  if(fl>0){ c.fillStyle=`rgba(215,225,255,${fl*(reduce?.12:.5)})`; c.fillRect(0,0,W,H); }
  S.sx=0; S.sy=0; S.push=0; S.shake=Math.max(0,S.shake-dt*1.8);
}

/* ---------- Controls ---------- */
const rail=$('#rail');
FX.forEach(f=>{ const b=document.createElement('button'); b.type='button'; b.className='fx-btn'; b.id='fx-'+f.id; b.dataset.id=f.id;
  b.setAttribute('aria-label',f.label+(f.mode==='hold'?' (switch on or off)':' (one burst)')); if(f.mode==='hold') b.setAttribute('aria-pressed','false');
  b.innerHTML='<span class="key">'+f.key+'</span><i class="dot"></i><svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[f.id]+'</svg><span class="lab">'+f.label+'</span>'; rail.appendChild(b); });
rail.addEventListener('click',e=>{ const b=e.target.closest('.fx-btn'); if(b) trigger(b.dataset.id); });

function start(){ if(started) return; started=true; stage.classList.add('open'); Snd.init(); Snd.resume(); Snd.score(); }
function setHold(id,v){ on[id]=v; const b=$('#fx-'+id); if(b){ b.classList.toggle('on',v); b.setAttribute('aria-pressed',String(v)); } Snd.hold(id,v); }
function burst(id){
  const b=$('#fx-'+id); if(b){ b.classList.add('firing'); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove('firing'),FXMAP[id].dur); }
  fxBurst[id](); Snd.burst(id);
  try{ if(navigator.vibrate) navigator.vibrate(id==='lightning'?[60,40,30]:[40]); }catch(e){}
}
function trigger(id){ start(); if(FXMAP[id].mode==='hold') setHold(id,!on[id]); else burst(id); }
const goBtn=$('#go'); if(goBtn) goBtn.addEventListener('click',start);
addEventListener('keydown',e=>{ if(e.ctrlKey||e.metaKey||e.altKey) return; const f=FX.find(x=>x.key===e.key); if(f){ e.preventDefault(); trigger(f.id); } });

/* the show */
const SHOW=[[0,'fog',1],[2,'wind',1],[4.5,'rain',1],[8,'lightning'],[11,'lightning'],[13.5,'rain',0],[14.5,'fire',1],[17,'air'],[20,'air'],[24,'fire',0],[25,'wind',0],[25.5,'bubbles',1],[31,'bubbles',0],[31.5,'snow',1],[37,'snow',0],[38,'fog',0]];
const SHOW_END=40; let showT=[], showStart=0;
const showBtn=$('#show'), showLbl=$('#showLbl');
function allOff(){ FX.forEach(f=>{ if(f.mode==='hold'&&on[f.id]) setHold(f.id,false); }); }
function stopShow(){ showT.forEach(clearTimeout); showT=[]; showing=false; if(showBtn){ showBtn.setAttribute('aria-pressed','false'); showBtn.style.setProperty('--p',0); } if(showLbl) showLbl.textContent='Play the show'; allOff(); }
if(showBtn) showBtn.addEventListener('click',()=>{ start(); if(showing){ stopShow(); return; } allOff(); showing=true; showStart=performance.now(); showBtn.setAttribute('aria-pressed','true'); if(showLbl) showLbl.textContent='Stop the show';
  SHOW.forEach(s=>showT.push(setTimeout(()=>{ if(s[2]===undefined) burst(s[1]); else setHold(s[1],!!s[2]); },s[0]*1000))); showT.push(setTimeout(stopShow,SHOW_END*1000)); });
const densEl=$('#dens'); if(densEl) densEl.addEventListener('input',e=>{ D=.35+.65*(+e.target.value)/100; });
if(innerWidth<700 && densEl){ densEl.value=55; D=.35+.65*.55; }
const sheet=document.querySelector('.plan'), scrim=$('#scrim');
function sheetOpen(v){ if(sheet) sheet.classList.toggle('is-open',v); if(scrim) scrim.classList.toggle('is-open',v); }
const seatBtn=$('#seatBtn'); if(seatBtn) seatBtn.addEventListener('click',()=>sheetOpen(true));
if(scrim) scrim.addEventListener('click',()=>sheetOpen(false));
const sheetClose=$('#sheetClose'); if(sheetClose) sheetClose.addEventListener('click',()=>sheetOpen(false));
addEventListener('keydown',e=>{ if(e.key==='Escape') sheetOpen(false); });

/* sound + fullscreen */
const sndBtn=$('#snd'); let muted=false;
if(sndBtn) sndBtn.addEventListener('click',()=>{ muted=!muted; Snd.mute(muted); sndBtn.textContent=muted?'Sound off':'Sound on'; sndBtn.setAttribute('aria-pressed',String(!muted)); });
const fsBtn=$('#fs');
if(fsBtn){
  if(!document.fullscreenEnabled) fsBtn.hidden=true;
  fsBtn.addEventListener('click',()=>{ if(document.fullscreenElement) document.exitFullscreen(); else hall.requestFullscreen().catch(()=>{ fsBtn.disabled=true; fsBtn.textContent='Fullscreen unavailable'; }); });
}

/* ---------- Cabin plan and seat choice ---------- */
const seatsData=[];
['A','B'].forEach((row,ri)=>{ const y=ri?3437:2212; for(let k=0;k<8;k++){ const x=k<4?1375+k*609:4100+(k-4)*609; seatsData.push({id:row+(k+1),x:x,y:y,cx:x+304,cy:y+475}); } });
const plan=$('#planSvg');
if(plan){
  let svg='<rect class="p-wall" x="0" y="0" width="7210" height="4700" rx="60"/>'
   +'<rect class="p-fill" x="-1040" y="2125" width="1040" height="2500" rx="320"/><text class="p-txt" x="-520" y="3420" text-anchor="middle">Driver</text><text class="p-txt" x="-520" y="3640" text-anchor="middle">cabin</text>'
   +'<rect class="p-fill" x="100" y="975" width="712" height="675" rx="40"/><text class="p-txt" x="456" y="1380" text-anchor="middle">Control</text>'
   +'<text class="p-txt" x="7000" y="1000" text-anchor="end">Acoustic panel</text>'
   +'<polygon class="p-beam" points="1775,95 6175,95 3940,3600"/>'
   +'<rect x="1775" y="30" width="4400" height="64" rx="20" fill="#ece4d6"/><text class="p-txt" x="3975" y="-120" text-anchor="middle">Screen 4.40 m</text>'
   +'<rect x="3860" y="3560" width="160" height="130" rx="30" fill="#ffb347"/>'
   +'<path d="M0 -330H7210M0 -400V-260M7210 -400V-260" stroke="rgba(236,228,214,.35)" stroke-width="20" fill="none"/><text class="p-txt" x="3605" y="-420" text-anchor="middle" style="display:none"></text>'
   +'<text class="p-txt" x="3605" y="-370" text-anchor="middle" dy="-30">7.21 m</text>'
   +'<text class="p-txt" x="1180" y="2760" text-anchor="end">A</text><text class="p-txt" x="1180" y="3990" text-anchor="end">B</text>';
  seatsData.forEach(s=>{ svg+='<g class="seat" data-seat="'+s.id+'" tabindex="0" role="button" aria-label="Seat '+s.id+'" aria-pressed="false"><title>Seat '+s.id+'</title>'
    +'<rect class="s" x="'+(s.x+25)+'" y="'+s.y+'" width="560" height="950" rx="120"/><rect class="b" x="'+(s.x+25)+'" y="'+(s.y+720)+'" width="560" height="230" rx="110"/>'
    +'<text x="'+s.cx+'" y="'+(s.cy+10)+'" text-anchor="middle">'+s.id.slice(1)+'</text></g>'; });
  plan.innerHTML=svg;
}

function selectSeat(id){
  const s=seatsData.find(x=>x.id===id); if(!s) return;
  if(plan) plan.querySelectorAll('.seat').forEach(g=>{ const sel=g.dataset.seat===id; g.classList.toggle('sel',sel); g.setAttribute('aria-pressed',String(sel)); });
  const xm=s.cx/1000, off=xm-3.605, dist=(s.cy-60)/1000;
  S.seatOff=off; S.seatBack=dist-2.6;
  const sb=$('#seatBig'), tk=$('#tkSeat'), sbl=$('#seatBtnLbl'), si=$('#seatInfo');
  if(sb) sb.textContent=id;
  if(tk) tk.textContent=id;
  if(sbl) sbl.textContent='Seat '+id;
  if(si) si.textContent=dist.toFixed(1)+' m from the screen · '+(Math.abs(off)<.15?'on the centre line':Math.abs(off).toFixed(1)+' m '+(off<0?'left':'right')+' of centre');
}
if(plan){
  plan.addEventListener('click',e=>{ const g=e.target.closest('.seat'); if(g){ selectSeat(g.dataset.seat); if(sheet&&sheet.classList.contains('is-open')) setTimeout(()=>sheetOpen(false),450); } });
  plan.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ const g=e.target.closest('.seat'); if(g){ e.preventDefault(); selectSeat(g.dataset.seat); } } });
}
selectSeat('B4');

/* ---------- Boot ---------- */
let GL=null;
try{ GL=initGL(); }catch(err){ GL=null; if(stage) stage.classList.add('no-gl'); const glEl=$('#gl'); if(glEl) glEl.style.display='none'; }
const seatsEl=$('#seats');
function onResize(){ sizeFx(); if(GL) GL.resize(stage.clientWidth||800,stage.clientHeight||500); }
if(window.ResizeObserver && stage){ new ResizeObserver(onResize).observe(stage); }
onResize();
if('IntersectionObserver' in window && stage) new IntersectionObserver(es=>{ visible=es[0].isIntersecting; }).observe(stage);
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  if(!visible||document.hidden){ last=now; return; }
  const dt=Math.min(.05,(now-last)/1000); last=now; const t=now/1000;
  FX.forEach(f=>{ if(f.mode==='hold') lvl[f.id]+=((on[f.id]?1:0)-lvl[f.id])*Math.min(1,dt*2.5); });
  fxStep(dt,t);
  if(GL) GL.render(dt,t);
  if(seatsEl) seatsEl.style.transform='translate('+(-S.seatOff*16+S.sx*mo+(R()-.5)*S.shake*6*mo).toFixed(1)+'px,'+(S.sy*mo).toFixed(1)+'px)';
  if(showing&&showBtn) showBtn.style.setProperty('--p',Math.min(1,(now-showStart)/(SHOW_END*1000)).toFixed(3));
}
requestAnimationFrame(frame);
})();
