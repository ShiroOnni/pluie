/* script.js */
const rainCanvas = document.getElementById('rain-canvas');
const rainCtx = rainCanvas.getContext('2d');
const lightningCanvas = document.getElementById('lightning-canvas');
const lightningCtx = lightningCanvas.getContext('2d');
const rainAudio = document.getElementById('rain-audio');
const thunderAudio = document.getElementById('thunder-audio');
const overlay = document.getElementById('start-overlay');
const container = document.getElementById('text-container');

// Responsivité canvas
window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
  const w = window.innerWidth, h = window.innerHeight;
  [rainCanvas, lightningCanvas].forEach(c => { c.width = w; c.height = h; });
}
resizeCanvas();

// Pluie : paramètres
const rainLayers = [
  { count: 400, vy: [3,5], vx: [-1,1], len: [20,30], width: 1, opacity: [0.2,0.5] },
  { count: 200, vy: [5,7], vx: [-0.5,0.5], len: [25,35], width: 2, opacity: [0.5,0.8] }
];
const drops = [];
const splashes = [];

function initRain() {
  drops.length = 0; splashes.length = 0;
  rainLayers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      drops.push({
        x: Math.random()*rainCanvas.width,
        y: Math.random()*rainCanvas.height,
        vy: Math.random()*(layer.vy[1]-layer.vy[0])+layer.vy[0],
        vx: Math.random()*(layer.vx[1]-layer.vx[0])+layer.vx[0],
        length: Math.random()*(layer.len[1]-layer.len[0])+layer.len[0],
        width: layer.width,
        opacity: Math.random()*(layer.opacity[1]-layer.opacity[0])+layer.opacity[0]
      });
    }
  });
}

function drawRain() {
  rainCtx.clearRect(0,0,rainCanvas.width,rainCanvas.height);
  rainCtx.shadowBlur = 5; rainCtx.shadowColor = 'rgba(174,194,224,0.5)';
  drops.forEach((d,i) => {
    rainCtx.beginPath();
    rainCtx.strokeStyle = `rgba(174,194,224,${d.opacity})`;
    rainCtx.lineWidth = d.width;
    rainCtx.moveTo(d.x,d.y);
    rainCtx.lineTo(d.x+d.vx*2, d.y+d.length);
    rainCtx.stroke();
    d.x += d.vx; d.y += d.vy;
    if (d.y > rainCanvas.height) {
      createSplash(d.x, rainCanvas.height-2, 5);
      d.y = -d.length; d.x = Math.random()*rainCanvas.width;
    }
  });
  splashes.forEach((s,idx) => {
    rainCtx.beginPath(); rainCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
    rainCtx.fillStyle = `rgba(174,194,224,${s.alpha})`; rainCtx.fill();
    s.x+=s.vx; s.y+=s.vy; s.alpha-=0.03;
    if (s.alpha<=0) splashes.splice(idx,1);
  });
  requestAnimationFrame(drawRain);
}

function createSplash(x,y,count){ for(let i=0;i<count;i++){ splashes.push({ x,y,r:Math.random()*2+1,alpha:1,vx:(Math.random()-0.5)*3,vy:-Math.random()*2-1 }); }}

// Foudre : dessin du bolt
function drawBolt() {
  const w = lightningCanvas.width, h = lightningCanvas.height;
  const seg = [{ x:Math.random()*w, y:0 }];
  while(seg[seg.length-1].y < h) {
    const p = seg[seg.length-1];
    seg.push({ x: p.x+(Math.random()-0.5)*(h/15), y: p.y+Math.random()*(h/8) });
  }
  lightningCtx.clearRect(0,0,w,h);
  lightningCtx.strokeStyle='rgba(255,255,255,0.9)';
  lightningCtx.lineWidth=2+Math.random()*2;
  lightningCtx.shadowBlur=10; lightningCtx.shadowColor='white';
  lightningCtx.beginPath(); lightningCtx.moveTo(seg[0].x,seg[0].y);
  seg.forEach(pt=>lightningCtx.lineTo(pt.x,pt.y)); lightningCtx.stroke();
}

// Déclenchement de la foudre avec son
function triggerLightning() {
  thunderAudio.currentTime = 0;
  thunderAudio.play();
  const flashes = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < flashes; i++) {
    setTimeout(drawBolt, i * 80);
    setTimeout(() => lightningCanvas.style.opacity = 1, i * 80);
    setTimeout(() => { lightningCanvas.style.opacity = 0; lightningCtx.clearRect(0,0,lightningCanvas.width,lightningCanvas.height); }, i * 80 + 100);
  }
  setTimeout(triggerLightning, Math.random() * 4000 + 1000);
}

// Texte animé : message d'excuse
const lines = [
  "Syrine, je suis totalement désolée pour ce qui s'est passé entre nous depuis hier soir.",
  "C'est moi le fautif dans l'histoire : j'ai recommencé mes vieilles habitudes et pour ça je m'en excuse.",
  "(Sinon, il est bien le site, non ?)",
  "Désolée encore car je sais que pour toi c'est insupportable la façon dont j'agis, et je le vois, ça te fait du mal.",
  "Ça me fait du mal aussi ; je ne le referai plus, pardonne-moi.",
  "Je pleure comme la pluie qui tombe.",
  "Si un jour tu veux venir sur le site, il est à toi et ça te montre à quel point je suis désolée."
];
let currentLine = 0, currentChar = 0;
function typeText() {
  if (currentLine >= lines.length) return;
  if (currentChar === 0) {
    const p = document.createElement('p'); p.classList.add('line'); container.appendChild(p);
  }
  const p = container.querySelector(`.line:nth-child(${currentLine + 1})`);
  p.textContent = lines[currentLine].slice(0, currentChar + 1);
  p.classList.add('visible');
  currentChar++;
  if (currentChar < lines[currentLine].length) {
    setTimeout(typeText, 80);
  } else {
    currentLine++; currentChar = 0;
    setTimeout(typeText, 400);
  }
}

// Démarrage après interaction utilisateur
overlay.addEventListener('click', startStorm);
function startStorm() {
  overlay.remove();
  rainAudio.play();
  initRain();
  drawRain();
  triggerLightning();
  typeText();
}
