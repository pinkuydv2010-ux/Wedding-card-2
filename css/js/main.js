/* ===== Three.js: gold particles + flower petals (+ golden shower for finale) ===== */
const cv=document.getElementById('fx');
const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(60,1,.1,100);C.position.z=10;
const mk=f=>{const c=document.createElement('canvas');c.width=c.height=64;f(c.getContext('2d'));return new THREE.CanvasTexture(c)};
const dotT=mk(g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#fff');r.addColorStop(.3,'rgba(255,215,100,.85)');r.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const petT=mk(g=>{g.translate(32,32);g.rotate(-.6);g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,26,12,0,0,7);g.fill()});
const layers=[];
function layer(n,tex,size,color,add,speed,opacity){
  const p=new Float32Array(n*3);
  for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*26;p[i*3+1]=(Math.random()-.5)*18;p[i*3+2]=(Math.random()-.5)*10}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.PointsMaterial({map:tex,size,color,transparent:true,opacity,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});
  const pts=new THREE.Points(g,m);S.add(pts);const L={pts,p,n,speed,opacity,shower:false};layers.push(L);return L;
}
layer(140,dotT,.35,0xffd966,true,.004,.9);
layer(55,petT,.55,0xf4a6b8,false,.011,.9);
layer(40,petT,.5,0xffb347,false,.015,.9);
const shower=layer(260,petT,.5,0xffc94d,false,.05,0);shower.shower=true;
const fxState={burst:0};let mx=0,my=0,t=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function size(){R.setSize(innerWidth,innerHeight,false);C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix()}
addEventListener('resize',size);size();
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
(function loop(){
  t+=.016;
  for(const L of layers){
    const sp=L.shower?L.speed:L.speed*(1+fxState.burst*2);
    if(L.shower)L.pts.material.opacity=fxState.burst*.95;
    for(let i=0;i<L.n;i++){
      L.p[i*3+1]-=sp*(reduce?.3:1);L.p[i*3]+=Math.sin(t+i)*.005;
      if(L.p[i*3+1]<-9){L.p[i*3+1]=9;L.p[i*3]=(Math.random()-.5)*26}
    }
    L.pts.geometry.attributes.position.needsUpdate=true;
  }
  C.position.x+=(mx*1.2-C.position.x)*.03;C.position.y+=(-my*.8-C.position.y)*.03;C.lookAt(0,0,0);
  R.render(S,C);requestAnimationFrame(loop);
})();

/* ===== GSAP cinematic timeline ===== */
gsap.set('.card',{xPercent:-50,yPercent:-50});
gsap.set('#cards',{transformPerspective:1600});
const tiltY=gsap.quickTo('#cards','rotationY',{duration:1.2}),tiltX=gsap.quickTo('#cards','rotationX',{duration:1.2});
addEventListener('pointermove',e=>{tiltY((e.clientX/innerWidth-.5)*6);tiltX(-(e.clientY/innerHeight-.5)*4)});

const turn=(id,prev)=>[
  ['#'+id,{autoAlpha:1,rotationY:-105,transformOrigin:'0% 50%',z:-120},{autoAlpha:1,rotationY:0,z:0,duration:2.2,ease:'power2.inOut'}],
  prev?['#'+prev,{},{autoAlpha:0,duration:.6,ease:'none'},'-=.5']:null
].filter(Boolean);

let tl;
function build(){
  tl=gsap.timeline({paused:true});
  // SCENE 1
  tl.addLabel('s1').set('#s1',{autoAlpha:1})
    .set('#gan,#t1,#t2',{autoAlpha:0})
    .to('.doorL',{rotationY:-112,duration:3.4,ease:'power2.inOut'},.8)
    .to('.doorR',{rotationY:112,duration:3.4,ease:'power2.inOut'},.8)
    .fromTo('#gan',{scale:.3,autoAlpha:0},{scale:1,autoAlpha:1,duration:2.2,ease:'back.out(1.4)'},1.8)
    .fromTo('#t1',{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:1.4},3.2)
    .fromTo('#t2',{scale:.8,autoAlpha:0,letterSpacing:'.3em'},{scale:1,autoAlpha:1,letterSpacing:'0em',duration:1.8},3.8)
    .to('#gan',{boxShadow:'0 0 50px 18px rgba(246,224,138,.8),0 0 130px 50px rgba(212,175,55,.5)',duration:1.2,yoyo:true,repeat:1},4)
    .to({},{duration:2.2});
  // SCENE 2 - cover
  tl.addLabel('s2').to('#s1',{autoAlpha:0,scale:1.15,duration:1.2},'>')
    .fromTo('#c1',{autoAlpha:0,rotationX:-85,z:-700,transformOrigin:'50% 100%'},{autoAlpha:1,rotationX:0,z:0,duration:2.6,ease:'power3.out'},'<.3')
    .fromTo('#c1',{scale:1},{scale:1.035,duration:7,ease:'sine.inOut'},'<')
    .to({},{duration:3});
  // SCENE 3 - front page turns in
  tl.addLabel('s3');
  for(const a of turn('c2','c1'))tl.fromTo(...a);
  tl.fromTo('#c2',{scale:1},{scale:1.03,duration:7,ease:'sine.inOut'},'<').to({},{duration:3.5});
  // SCENE 4 - family invitation, slow reveal
  tl.addLabel('s4');
  for(const a of turn('c3','c2'))tl.fromTo(...a);
  tl.fromTo('#c3 img',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:6,ease:'power1.inOut'},'<1.4').to({},{duration:3.5});
  // SCENE 5 - programme, mandap + baraat highlighted
  tl.addLabel('s5');
  for(const a of turn('c4','c3'))tl.fromTo(...a);
  tl.fromTo('#c4 img',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:3.2,ease:'power1.inOut'},'<1.2')
    .to('#c4 .hl',{opacity:1,duration:1.2,stagger:.9},'>').to({},{duration:5});
  // FINAL
  tl.addLabel('fin').to('#c4',{autoAlpha:0,duration:1.2})
    .set('#fin',{autoAlpha:0}).to('#fin',{autoAlpha:1,duration:1.4},'<')
    .fromTo('#names',{scale:.7,autoAlpha:0},{scale:1,autoAlpha:1,duration:2,ease:'power3.out'},'<.4')
    .fromTo('#inv',{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:1.8},'>-.6')
    .to(fxState,{burst:1,duration:3},'<')
    .to({},{duration:7})
    .to('#fin',{autoAlpha:0,duration:3})
    .to(fxState,{burst:0,duration:3},'<');
}
build();

/* ===== Controls ===== */
const bgm=document.getElementById('bgm'),start=document.getElementById('start');
function play(){tl.restart();}
document.getElementById('go').onclick=()=>{
  const el=document.documentElement;
  try{(el.requestFullscreen||el.webkitRequestFullscreen).call(el)}catch(e){}
  bgm.volume=.6;bgm.play().catch(()=>{});
  gsap.to(start,{autoAlpha:0,duration:.8});play();
};
document.getElementById('replay').onclick=()=>{
  gsap.set(['.card','#fin','#s1'],{autoAlpha:0});gsap.set('.door',{rotationY:0});
  gsap.set('#c4 .hl',{opacity:0});fxState.burst=0;bgm.currentTime=0;bgm.play().catch(()=>{});play();
};
document.getElementById('mute').onclick=e=>{bgm.muted=!bgm.muted;e.target.textContent=bgm.muted?'🔇':'🔊'};
document.getElementById('full').onclick=()=>{
  if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.();
};
/* tap anywhere on the stage = skip to next scene */
document.getElementById('stage').addEventListener('click',()=>{
  const labels=['s1','s2','s3','s4','s5','fin'].map(l=>tl.labels[l]);
  const nxt=labels.find(x=>x>tl.time()+.5);
  if(nxt!==undefined)tl.tweenTo(nxt,{duration:.6,ease:'none'}).then(()=>tl.play());
});
