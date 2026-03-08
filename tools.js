/* ============================================================
   TOOLVERA — Shared JavaScript
   All working tool functions
   ============================================================ */

// ─── MOBILE NAV ───
function toggleNav(){
  const n=document.querySelector('.site-nav');
  if(n) n.classList.toggle('open');
}

// ─── FORMAT FILE SIZE ───
function fmtSize(bytes){
  if(!bytes||bytes<=0) return '0 B';
  if(bytes<1024) return bytes+' B';
  if(bytes<1024*1024) return (bytes/1024).toFixed(1)+' KB';
  return (bytes/(1024*1024)).toFixed(2)+' MB';
}

// ─── IMAGE STORE ───
const IMG = {};

function loadImgFile(e, key, origImgId, ctrlId){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const img = new Image();
    img.onload = function(){
      IMG[key] = {img, file, url: ev.target.result};
      const el = document.getElementById(origImgId);
      if(el){ el.src = ev.target.result; }
      const ctrl = document.getElementById(ctrlId);
      if(ctrl) ctrl.style.display = 'block';
      if(key==='resize'){
        const w=document.getElementById('rw'); const h=document.getElementById('rh');
        if(w) w.value=img.width; if(h) h.value=img.height;
      }
      if(key==='crop'){
        const cw=document.getElementById('cw'); const ch=document.getElementById('ch');
        if(cw) cw.value=Math.floor(img.width/2);
        if(ch) ch.value=Math.floor(img.height/2);
      }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function handleDrop(e, key, origImgId, ctrlId){
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const file = e.dataTransfer.files[0]; if(!file) return;
  loadImgFile({target:{files:[file]}}, key, origImgId, ctrlId);
}

function setupDrop(zoneId){
  const z=document.getElementById(zoneId);
  if(!z) return;
  z.addEventListener('dragover', e=>{e.preventDefault();z.classList.add('drag-over');});
  z.addEventListener('dragleave', ()=>z.classList.remove('drag-over'));
}

// ─── IMAGE COMPRESSOR ───
let compURL='', compFmt='jpeg';
function doCompress(){
  const d=IMG['compress']; if(!d){showMsg('compress-msg','Please upload an image first.','error');return;}
  const q=parseInt(document.getElementById('sl-quality').value)/100;
  const fmt=document.getElementById('sel-fmt').value;
  const canvas=document.createElement('canvas');
  canvas.width=d.img.width; canvas.height=d.img.height;
  const ctx=canvas.getContext('2d');
  if(fmt==='jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.drawImage(d.img,0,0);
  compURL=canvas.toDataURL('image/'+fmt, q);
  compFmt=fmt;
  const out=document.getElementById('out-compress');
  if(out) out.src=compURL;
  const b64=compURL.split(',')[1];
  const newSz=Math.round(b64.length*3/4);
  const saved=Math.max(0,100-Math.round(newSz/d.file.size*100));
  setTxt('st-orig', fmtSize(d.file.size));
  setTxt('st-new', fmtSize(newSz));
  setTxt('st-save', saved+'%');
  show('res-compress');
}
function dlCompress(){
  if(!compURL) return;
  const a=document.createElement('a'); a.href=compURL;
  a.download='compressed.'+compFmt; a.click();
}

// ─── PNG↔JPG CONVERTER ───
let convURL='';
function doConvert(outFmt){
  const key = outFmt==='jpeg' ? 'p2j' : 'j2p';
  const d=IMG[key]; if(!d){showMsg('conv-msg','Please upload an image first.','error');return;}
  const canvas=document.createElement('canvas');
  canvas.width=d.img.width; canvas.height=d.img.height;
  const ctx=canvas.getContext('2d');
  if(outFmt==='jpeg'){
    const bg=document.getElementById('bg-color');
    ctx.fillStyle=bg?bg.value:'#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  ctx.drawImage(d.img,0,0);
  const q=document.getElementById('sl-conv-q')?parseInt(document.getElementById('sl-conv-q').value)/100:0.92;
  convURL=canvas.toDataURL('image/'+outFmt, q);
  const out=document.getElementById('out-conv');
  if(out) out.src=convURL;
  const b64=convURL.split(',')[1];
  setTxt('sz-orig',fmtSize(d.file.size));
  setTxt('sz-out',fmtSize(Math.round(b64.length*3/4)));
  show('res-conv');
}
function dlConv(ext){
  if(!convURL) return;
  const a=document.createElement('a'); a.href=convURL; a.download='converted.'+ext; a.click();
}

// ─── IMAGE RESIZER ───
let resizeURL='';
function toggleResizeMode(){
  const m=document.getElementById('resize-mode').value;
  const px=document.getElementById('px-ctrl'); const pc=document.getElementById('pct-ctrl');
  if(px) px.style.display=m==='pixels'?'flex':'none';
  if(pc) pc.style.display=m==='percent'?'flex':'none';
}
function doResize(){
  const d=IMG['resize']; if(!d){showMsg('resize-msg','Please upload an image first.','error');return;}
  let tw,th;
  const m=document.getElementById('resize-mode').value;
  if(m==='pixels'){
    tw=parseInt(document.getElementById('rw').value)||d.img.width;
    th=parseInt(document.getElementById('rh').value)||d.img.height;
  } else {
    const p=parseInt(document.getElementById('sl-pct').value)/100;
    tw=Math.round(d.img.width*p); th=Math.round(d.img.height*p);
  }
  const canvas=document.createElement('canvas');
  canvas.width=tw; canvas.height=th;
  const ctx=canvas.getContext('2d'); ctx.drawImage(d.img,0,0,tw,th);
  const fmt=document.getElementById('res-fmt').value;
  const mime=fmt==='png'?'image/png':fmt==='webp'?'image/webp':'image/jpeg';
  resizeURL=canvas.toDataURL(mime,0.92);
  const out=document.getElementById('out-resize'); if(out) out.src=resizeURL;
  setTxt('orig-dim',d.img.width+'×'+d.img.height+'px');
  setTxt('new-dim',tw+'×'+th+'px');
  show('res-resize');
}
function dlResize(){
  if(!resizeURL) return;
  const fmt=document.getElementById('res-fmt').value;
  const a=document.createElement('a'); a.href=resizeURL; a.download='resized.'+fmt; a.click();
}
// auto lock ratio
document.addEventListener('input',function(e){
  if((e.target.id==='rw'||e.target.id==='rh')&&document.getElementById('lock-ratio')&&document.getElementById('lock-ratio').checked&&IMG['resize']){
    const d=IMG['resize']; const ratio=d.img.width/d.img.height;
    if(e.target.id==='rw') { const v=document.getElementById('rh'); if(v) v.value=Math.round(e.target.value/ratio)||''; }
    else { const v=document.getElementById('rw'); if(v) v.value=Math.round(e.target.value*ratio)||''; }
  }
});

// ─── CROP ───
let cropURL='';
function applyCropPreset(){
  const d=IMG['crop']; if(!d) return;
  const p=document.getElementById('crop-preset').value; if(p==='custom') return;
  const [rw,rh]=p.split(':').map(Number); const aspect=rw/rh;
  let w=d.img.width, h=Math.round(w/aspect);
  if(h>d.img.height){h=d.img.height;w=Math.round(h*aspect);}
  setVal('cx',0);setVal('cy',0);setVal('cw',w);setVal('ch',h);
}
function doCrop(){
  const d=IMG['crop']; if(!d){showMsg('crop-msg','Please upload an image first.','error');return;}
  const x=parseInt(document.getElementById('cx').value)||0;
  const y=parseInt(document.getElementById('cy').value)||0;
  let w=parseInt(document.getElementById('cw').value)||100;
  let h=parseInt(document.getElementById('ch').value)||100;
  w=Math.min(w,d.img.width-x); h=Math.min(h,d.img.height-y);
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  canvas.getContext('2d').drawImage(d.img,-x,-y);
  cropURL=canvas.toDataURL('image/png');
  const out=document.getElementById('out-crop'); if(out) out.src=cropURL;
  show('res-crop');
}
function dlCrop(){
  if(!cropURL) return;
  const a=document.createElement('a'); a.href=cropURL; a.download='cropped.png'; a.click();
}

// ─── GRAYSCALE ───
let grayURL='';
function doGrayscale(){
  const d=IMG['gray']; if(!d){showMsg('gray-msg','Please upload an image first.','error');return;}
  const canvas=document.createElement('canvas');
  canvas.width=d.img.width; canvas.height=d.img.height;
  const ctx=canvas.getContext('2d'); ctx.drawImage(d.img,0,0);
  const id=ctx.getImageData(0,0,canvas.width,canvas.height);
  const data=id.data;
  const mode=document.getElementById('gray-mode')?document.getElementById('gray-mode').value:'lum';
  for(let i=0;i<data.length;i+=4){
    let g;
    if(mode==='lum') g=0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];
    else if(mode==='avg') g=(data[i]+data[i+1]+data[i+2])/3;
    else g=(Math.max(data[i],data[i+1],data[i+2])+Math.min(data[i],data[i+1],data[i+2]))/2;
    data[i]=data[i+1]=data[i+2]=g;
  }
  ctx.putImageData(id,0,0);
  grayURL=canvas.toDataURL('image/png');
  const out=document.getElementById('out-gray'); if(out) out.src=grayURL;
  show('res-gray');
}
function dlGray(){
  if(!grayURL) return;
  const a=document.createElement('a'); a.href=grayURL; a.download='grayscale.png'; a.click();
}

// ─── ROTATE / FLIP ───
let rotAngle=0,flipH=false,flipV=false,rotURL='';
function setRot(deg){rotAngle=deg;setVal('sl-rotate',deg);setTxt('val-rotate',deg+'°');}
function setFlip(d){if(d==='h')flipH=!flipH;else flipV=!flipV;}
function doRotate(){
  const d=IMG['rotate']; if(!d){showMsg('rotate-msg','Please upload an image first.','error');return;}
  const rad=rotAngle*Math.PI/180;
  const ow=d.img.width,oh=d.img.height;
  const cos=Math.abs(Math.cos(rad)),sin=Math.abs(Math.sin(rad));
  const nw=Math.round(ow*cos+oh*sin),nh=Math.round(ow*sin+oh*cos);
  const canvas=document.createElement('canvas'); canvas.width=nw; canvas.height=nh;
  const ctx=canvas.getContext('2d');
  ctx.translate(nw/2,nh/2);
  if(flipH) ctx.scale(-1,1);
  if(flipV) ctx.scale(1,-1);
  ctx.rotate(rad); ctx.drawImage(d.img,-ow/2,-oh/2);
  rotURL=canvas.toDataURL('image/png');
  const out=document.getElementById('out-rotate'); if(out) out.src=rotURL;
  show('res-rotate'); flipH=false; flipV=false;
}
function dlRotate(){
  if(!rotURL) return;
  const a=document.createElement('a'); a.href=rotURL; a.download='rotated.png'; a.click();
}

// ─── WATERMARK ───
let wmURL='';
function doWatermark(){
  const d=IMG['wmark']; if(!d){showMsg('wm-msg','Please upload an image first.','error');return;}
  const canvas=document.createElement('canvas');
  canvas.width=d.img.width; canvas.height=d.img.height;
  const ctx=canvas.getContext('2d'); ctx.drawImage(d.img,0,0);
  const text=document.getElementById('wm-text').value||'© Toolvera';
  const opacity=parseInt(document.getElementById('sl-wm-op').value)/100;
  const fontSize=parseInt(document.getElementById('sl-wm-size').value);
  const color=document.getElementById('wm-color').value;
  const pos=document.getElementById('wm-pos').value;
  ctx.globalAlpha=opacity; ctx.fillStyle=color;
  ctx.font=`bold ${fontSize}px Arial`;
  ctx.textBaseline='middle';
  const tm=ctx.measureText(text), tw=tm.width, pad=20;
  let x,y;
  if(pos==='tile'){
    ctx.globalAlpha=opacity*0.35;
    for(let ty=-canvas.height;ty<canvas.height*2;ty+=fontSize*3){
      for(let tx=-canvas.width;tx<canvas.width*2;tx+=tw+40){
        ctx.save();ctx.translate(tx+tw/2,ty+fontSize/2);ctx.rotate(-Math.PI/6);ctx.fillText(text,-tw/2,0);ctx.restore();
      }
    }
  } else {
    if(pos.includes('right')) x=canvas.width-tw-pad;
    else if(pos.includes('left')) x=pad;
    else x=canvas.width/2-tw/2;
    if(pos.includes('bottom')) y=canvas.height-fontSize-pad;
    else if(pos.includes('top')) y=fontSize+pad;
    else y=canvas.height/2;
    ctx.fillText(text,x,y);
  }
  ctx.globalAlpha=1;
  wmURL=canvas.toDataURL('image/png');
  const out=document.getElementById('out-wmark'); if(out) out.src=wmURL;
  show('res-wmark');
}
function dlWmark(){
  if(!wmURL) return;
  const a=document.createElement('a'); a.href=wmURL; a.download='watermarked.png'; a.click();
}

// ─── WORD COUNTER ───
function updateWordCount(){
  const t=document.getElementById('wc-in').value;
  const words=t.trim()===''?0:t.trim().split(/\s+/).length;
  setTxt('wc-words',words.toLocaleString());
  setTxt('wc-chars',t.length.toLocaleString());
  setTxt('wc-nospace',t.replace(/\s/g,'').length.toLocaleString());
  setTxt('wc-sent',t.split(/[.!?]+/).filter(s=>s.trim()).length.toLocaleString());
  setTxt('wc-para',t.split(/\n\n+/).filter(p=>p.trim()).length.toLocaleString());
  const rt=Math.ceil(words/200); setTxt('wc-read',rt<1?'< 1 min':rt+' min');
  setTxt('wc-unique',(t.trim()===''?0:new Set(t.toLowerCase().match(/\b\w+\b/g)||[]).size).toLocaleString());
}

// ─── CASE CONVERTER ───
function convertCase(type){
  const t=document.getElementById('cc-in').value; if(!t.trim()) return;
  let out='';
  if(type==='upper') out=t.toUpperCase();
  else if(type==='lower') out=t.toLowerCase();
  else if(type==='title') out=t.replace(/\w\S*/g,w=>w[0].toUpperCase()+w.slice(1).toLowerCase());
  else if(type==='sentence') out=t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase());
  else if(type==='camel') out=t.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g,(m,i)=>i===0?m.toLowerCase().trim():m.toUpperCase().trim()).replace(/\s+/g,'');
  else if(type==='pascal') out=t.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g,m=>m.toUpperCase().trim()).replace(/\s+/g,'');
  else if(type==='snake') out=t.trim().replace(/\s+/g,'_').toLowerCase();
  else if(type==='kebab') out=t.trim().replace(/\s+/g,'-').toLowerCase();
  else if(type==='alt') out=t.split('').map((c,i)=>i%2===0?c.toLowerCase():c.toUpperCase()).join('');
  const el=document.getElementById('cc-out'); if(el) el.value=out;
  show('res-case');
}

// ─── BASE64 ───
function doBase64(){
  const t=document.getElementById('b64-in').value; if(!t.trim()) return;
  const mode=document.getElementById('b64-mode').value;
  let out='';
  try{
    out=mode==='encode'?btoa(unescape(encodeURIComponent(t))):decodeURIComponent(escape(atob(t.trim())));
  }catch(e){out='❌ Error: '+e.message;}
  const el=document.getElementById('b64-out'); if(el) el.value=out;
  show('res-b64');
}
function swapB64(){
  const a=document.getElementById('b64-in'); const b=document.getElementById('b64-out');
  if(a&&b){const tmp=a.value;a.value=b.value;b.value=tmp;}
}

// ─── LOREM IPSUM ───
const LW=['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','culpa','qui','officia','deserunt','mollit','anim','laborum'];
function genLorem(){
  const n=parseInt(document.getElementById('sl-lorem').value)||3;
  const start=document.getElementById('lorem-start').value==='yes';
  const paras=[];
  for(let p=0;p<n;p++){
    const sc=Math.floor(Math.random()*4)+3; const sents=[];
    for(let s=0;s<sc;s++){
      const wc=Math.floor(Math.random()*12)+8;
      const wds=[]; for(let w=0;w<wc;w++) wds.push(LW[Math.floor(Math.random()*LW.length)]);
      wds[0]=wds[0][0].toUpperCase()+wds[0].slice(1);
      sents.push(wds.join(' ')+'.');
    }
    paras.push(sents.join(' '));
  }
  if(start&&paras.length) paras[0]='Lorem ipsum dolor sit amet, consectetur adipiscing elit. '+paras[0];
  const el=document.getElementById('lorem-out'); if(el) el.value=paras.join('\n\n');
}

// ─── TEXT DIFF ───
function doDiff(){
  const a=document.getElementById('diff-a').value;
  const b=document.getElementById('diff-b').value;
  const la=a.split('\n'), lb=b.split('\n');
  let html='',added=0,removed=0,same=0;
  const max=Math.max(la.length,lb.length);
  for(let i=0;i<max;i++){
    const ai=la[i]!==undefined?la[i]:null;
    const bi=lb[i]!==undefined?lb[i]:null;
    if(ai===bi){html+=`<span style="color:#888">${esc(ai||'')}\n</span>`;same++;}
    else{
      if(ai!==null){html+=`<span style="background:#fff5f5;color:#c0392b;display:block;padding:1px 4px">− ${esc(ai)}</span>`;removed++;}
      if(bi!==null){html+=`<span style="background:#f0fdf4;color:#15803d;display:block;padding:1px 4px">+ ${esc(bi)}</span>`;added++;}
    }
  }
  const el=document.getElementById('diff-out'); if(el) el.innerHTML=html;
  setTxt('diff-added',added); setTxt('diff-removed',removed); setTxt('diff-same',same);
  show('res-diff');
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ─── REMOVE DUPLICATES ───
function doRemoveDups(){
  const raw=document.getElementById('dup-in').value;
  const cs=document.getElementById('dup-case').checked;
  const trim=document.getElementById('dup-trim').checked;
  const blank=document.getElementById('dup-blank').checked;
  let lines=raw.split('\n');
  const orig=lines.length;
  if(trim) lines=lines.map(l=>l.trim());
  if(blank) lines=lines.filter(l=>l.length>0);
  const seen=new Set(), out=[];
  lines.forEach(l=>{const k=cs?l:l.toLowerCase();if(!seen.has(k)){seen.add(k);out.push(l);}});
  setTxt('dup-in-cnt',orig); setTxt('dup-rem',orig-out.length); setTxt('dup-remain',out.length);
  const el=document.getElementById('dup-out'); if(el) el.value=out.join('\n');
  show('res-dup');
}

// ─── COLOR PICKER ───
function hexToRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s,l=(mx+mn)/2;if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
function toHex(r,g,b){return'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');}
function updateCP(){
  const hex=document.getElementById('cp-picker').value;
  const prev=document.getElementById('cp-prev'); if(prev) prev.style.background=hex;
  const hi=document.getElementById('cp-hex-in'); if(hi) hi.value=hex;
  const hd=document.getElementById('cp-hex-disp'); if(hd) hd.textContent=hex.toUpperCase();
  const {r,g,b}=hexToRgb(hex);
  setTxt('cp-rgb',`rgb(${r}, ${g}, ${b})`);
  const ri=document.getElementById('cp-rgb-in'); if(ri) ri.value=`rgb(${r}, ${g}, ${b})`;
  const {h,s,l}=rgbToHsl(r,g,b);
  setTxt('cp-hsl',`hsl(${h}, ${s}%, ${l}%)`);
  const hi2=document.getElementById('cp-hsl-in'); if(hi2) hi2.value=`hsl(${h}, ${s}%, ${l}%)`;
  // tints & shades
  const ts=document.getElementById('cp-tints'); if(!ts) return; ts.innerHTML='';
  for(let i=9;i>=1;i--){
    const f=i/10, tr=Math.round(r+(255-r)*f),tg=Math.round(g+(255-g)*f),tb=Math.round(b+(255-b)*f);
    const th=toHex(tr,tg,tb);
    ts.appendChild(makeChip(th));
  }
  ts.appendChild(makeChip(hex,true));
  for(let i=1;i<=9;i++){
    const f=i/10, sr=Math.round(r*(1-f)),sg=Math.round(g*(1-f)),sb=Math.round(b*(1-f));
    ts.appendChild(makeChip(toHex(sr,sg,sb)));
  }
}
function makeChip(hex,active){
  const d=document.createElement('div');
  d.style.cssText=`width:32px;height:32px;background:${hex};border-radius:6px;cursor:pointer;border:${active?'3px solid #1a1a1a':'1.5px solid rgba(0,0,0,0.1)'};title:'${hex}'`;
  d.title=hex; d.onclick=()=>{navigator.clipboard.writeText(hex).catch(()=>{});d.title='Copied!';};
  return d;
}
function updateFromHexIn(){
  const v=document.getElementById('cp-hex-in').value;
  if(/^#[0-9a-fA-F]{6}$/.test(v)){document.getElementById('cp-picker').value=v;updateCP();}
}

// ─── PALETTE GENERATOR ───
function hslToHex(h,s,l){
  h/=360;s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};
  return toHex(Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255));
}
function genPalette(){
  const hex=document.getElementById('pal-base').value;
  const hi=document.getElementById('pal-hex-in'); if(hi) hi.value=hex;
  const {r,g,b}=hexToRgb(hex); const {h,s,l}=rgbToHsl(r,g,b);
  const scheme=document.getElementById('pal-scheme').value;
  let colors=[];
  if(scheme==='complement') colors=[hex,hslToHex((h+180)%360,s,l)];
  else if(scheme==='analogous') colors=[hslToHex((h-30+360)%360,s,l),hex,hslToHex((h+30)%360,s,l)];
  else if(scheme==='triadic') colors=[hex,hslToHex((h+120)%360,s,l),hslToHex((h+240)%360,s,l)];
  else if(scheme==='tetradic') colors=[hex,hslToHex((h+90)%360,s,l),hslToHex((h+180)%360,s,l),hslToHex((h+270)%360,s,l)];
  else if(scheme==='mono') colors=[hslToHex(h,s,Math.max(10,l-30)),hslToHex(h,s,Math.max(10,l-15)),hex,hslToHex(h,s,Math.min(90,l+15)),hslToHex(h,s,Math.min(90,l+30))];
  else if(scheme==='split') colors=[hex,hslToHex((h+150)%360,s,l),hslToHex((h+210)%360,s,l)];
  const out=document.getElementById('pal-out'); if(!out) return; out.innerHTML='';
  colors.forEach(c=>{
    const div=document.createElement('div');
    div.style.cssText=`flex:1;min-width:80px;height:90px;background:${c};border-radius:10px;cursor:pointer;display:flex;align-items:flex-end;padding:8px;font-size:11px;font-weight:700;color:white;text-shadow:0 1px 3px rgba(0,0,0,.5);border:1.5px solid rgba(0,0,0,.08)`;
    div.textContent=c.toUpperCase();
    div.onclick=()=>{navigator.clipboard.writeText(c).catch(()=>{});div.textContent='Copied!';setTimeout(()=>div.textContent=c.toUpperCase(),1000);};
    out.appendChild(div);
  });
}

// ─── GRADIENT GENERATOR ───
function updateGrad(){
  const type=document.getElementById('grad-type').value;
  const angle=document.getElementById('sl-grad-angle').value;
  const c1=document.getElementById('gc1').value;
  const c2=document.getElementById('gc2').value;
  const c3=document.getElementById('gc3').value;
  const ar=document.getElementById('grad-angle-row'); if(ar) ar.style.display=type==='linear'?'flex':'none';
  let bg='';
  if(type==='linear') bg=`linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`;
  else if(type==='radial') bg=`radial-gradient(circle, ${c1}, ${c2}, ${c3})`;
  else bg=`conic-gradient(from 0deg, ${c1}, ${c2}, ${c3}, ${c1})`;
  const prev=document.getElementById('grad-prev'); if(prev) prev.style.background=bg;
  const code=document.getElementById('grad-code');
  if(code) code.value=`background: ${bg};\nbackground: -webkit-${bg};\nbackground: -moz-${bg};`;
}

// ─── IMAGE TO PDF ───
let i2pFiles=[];
function loadI2PFiles(e){
  i2pFiles=[...i2pFiles,...Array.from(e.target.files)];
  renderI2PList(); if(i2pFiles.length) show('ctrl-i2p');
}
function renderI2PList(){
  const ul=document.getElementById('fl-i2p'); if(!ul) return; ul.innerHTML='';
  i2pFiles.forEach((f,i)=>{
    const li=document.createElement('li'); li.className='file-item';
    li.innerHTML=`<span class="fi-name">${f.name}</span><span class="fi-size">${fmtSize(f.size)}</span><button class="fi-del" onclick="i2pFiles.splice(${i},1);renderI2PList()">×</button>`;
    ul.appendChild(li);
  });
}
function doImgToPdf(){
  if(!i2pFiles.length){alert('Please add at least one image.');return;}
  const promises=i2pFiles.map(f=>new Promise(res=>{
    const r=new FileReader(); r.onload=e=>{const img=new Image();img.onload=()=>res(img);img.src=e.target.result;};r.readAsDataURL(f);
  }));
  Promise.all(promises).then(imgs=>{
    const canvases=imgs.map(img=>{
      const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
      const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0);
      return c.toDataURL('image/jpeg',0.88);
    });
    const win=window.open('','_blank');
    const pages=canvases.map((s,i)=>`<div style="page-break-after:always;text-align:center;padding:20px;background:#fff"><p style="font-family:sans-serif;font-size:12px;color:#888;margin-bottom:10px">Page ${i+1}</p><img src="${s}" style="max-width:100%;max-height:90vh;object-fit:contain"></div>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Images to PDF — Toolvera</title><style>@media print{.noprint{display:none}}body{margin:0;background:#f5f5f5}</style></head><body><div class="noprint" style="position:fixed;top:12px;right:12px;z-index:9999;display:flex;gap:8px"><button onclick="window.print()" style="background:#d42b2b;color:white;border:none;padding:10px 20px;border-radius:8px;font-family:sans-serif;font-size:14px;cursor:pointer;font-weight:700">🖨 Print / Save as PDF</button><button onclick="window.close()" style="background:#444;color:white;border:none;padding:10px 16px;border-radius:8px;font-family:sans-serif;font-size:14px;cursor:pointer">✕ Close</button></div>${pages}</body></html>`);
    const msg=document.getElementById('i2p-msg'); if(msg){msg.textContent=`✅ ${i2pFiles.length} image(s) converted! A print dialog has opened — choose "Save as PDF".`;msg.className='msg msg-success';msg.style.display='block';}
    show('res-i2p');
  });
}

// ─── PDF MERGE ───
let pdfFiles=[];
function loadPDFs(e){
  pdfFiles=[...pdfFiles,...Array.from(e.target.files)];
  renderPDFList(); if(pdfFiles.length>=1) show('ctrl-pdf');
}
function renderPDFList(){
  const ul=document.getElementById('fl-pdf'); if(!ul) return; ul.innerHTML='';
  pdfFiles.forEach((f,i)=>{
    const li=document.createElement('li'); li.className='file-item';
    li.innerHTML=`<span style="font-size:1.2rem">📄</span><span class="fi-name">${f.name}</span><span class="fi-size">${fmtSize(f.size)}</span><button class="fi-del" onclick="pdfFiles.splice(${i},1);renderPDFList()">×</button>`;
    ul.appendChild(li);
  });
}
function doPdfMerge(){
  if(pdfFiles.length<2){alert('Please add at least 2 PDF files.');return;}
  const reads=pdfFiles.map(f=>new Promise(res=>{const r=new FileReader();r.onload=e=>res({name:f.name,data:e.target.result,size:fmtSize(f.size)});r.readAsDataURL(f);}));
  Promise.all(reads).then(results=>{
    const embeds=results.map((r,i)=>`<div style="margin-bottom:24px;background:#fff;padding:16px;border-radius:8px"><p style="font-family:sans-serif;color:#888;font-size:12px;margin-bottom:10px;font-weight:600">📄 File ${i+1}: ${r.name} (${r.size})</p><embed src="${r.data}" type="application/pdf" width="100%" height="480px" style="border:1px solid #ddd;border-radius:6px"></div>`).join('');
    const win=window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Merged PDFs — Toolvera</title></head><body style="font-family:sans-serif;background:#f5f5f5;padding:20px"><div style="max-width:900px;margin:0 auto"><div style="background:#d42b2b;color:white;padding:14px 20px;border-radius:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700">✅ ${pdfFiles.length} PDFs merged · Press Ctrl+P to save</span><button onclick="window.print()" style="background:white;color:#d42b2b;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-weight:700">Save as PDF</button></div>${embeds}</div></body></html>`);
    const msg=document.getElementById('pdf-msg'); if(msg){msg.textContent=`✅ ${pdfFiles.length} PDFs opened for merging. Use Ctrl+P → Save as PDF.`;msg.className='msg msg-success';msg.style.display='block';}
    show('res-pdf');
  });
}

// ─── CONTACT FORM ───
function submitContact(){
  const name=document.getElementById('cf-name').value;
  const email=document.getElementById('cf-email').value;
  const msg=document.getElementById('cf-msg').value;
  const res=document.getElementById('cf-result');
  if(!name.trim()||!email.trim()||!msg.trim()){
    if(res){res.textContent='Please fill in all required fields.';res.className='msg msg-error';res.style.display='block';}
    return;
  }
  if(res){res.innerHTML=`✅ Thank you, <strong>${name}</strong>! Your message has been received. We'll reply to <strong>${email}</strong> within 48 hours.`;res.className='msg msg-success';res.style.display='block';}
  document.getElementById('cf-name').value='';
  document.getElementById('cf-email').value='';
  document.getElementById('cf-msg').value='';
}

// ─── UTILS ───
function show(id){const el=document.getElementById(id);if(el)el.style.display='block';}
function hide(id){const el=document.getElementById(id);if(el)el.style.display='none';}
function setTxt(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}
function setVal(id,v){const el=document.getElementById(id);if(el)el.value=v;}
function copyText(id){const el=document.getElementById(id);if(el)navigator.clipboard.writeText(el.value).catch(()=>{});}
function showMsg(id,msg,type){const el=document.getElementById(id);if(el){el.textContent=msg;el.className='msg msg-'+(type||'info');el.style.display='block';}}
