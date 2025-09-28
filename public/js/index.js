const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
let sessionId = null;
const fotos = new Map();

ws.onopen = () => log('WS conectado');
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'sessionCreated') {
    sessionId = msg.payload.sessionId;
    showSession(sessionId);
  }
  if (msg.type === 'photo') {
    const p = msg.payload; fotos.set(p.id, p); addToGallery(p);
  }
  if (msg.type === 'uploadResult') {
    log('Upload result: ' + JSON.stringify(msg.payload));
    // generate visualizador link if available
    const urls = msg.payload.results.filter(r=>r.url).map(r=>r.url);
    if (urls.length) {
      const u = encodeURIComponent(urls.join('|'));
      const vlink = location.origin + '/visualizador.html?u=' + u;
      const info = document.getElementById('sessionInfo');
      info.innerHTML += `<p>Visualizador: <a href="${vlink}" target="_blank">Abrir</a></p>`;
    }
  }
  if (msg.type === 'resetDone') {
    log('Sessão finalizada e fotos locais limpadas');
    fotos.clear(); document.getElementById('gallery').innerHTML = '';
  }
};

function log(t) { const l = document.getElementById('logs'); l.innerText += '\n' + t; l.scrollTop = l.scrollHeight; }

function showSession(id) {
  const div = document.getElementById('sessionInfo');
  const controlUrl = location.origin + '/controle.html?session=' + id;
  div.innerHTML = `<p>Session: ${id}</p><p>Link de controle: <a href="${controlUrl}" target="_blank">Abrir (teste)</a></p><p>QR: (implemente lib de QR)</p>`;
}

function addToGallery(p) {
  const g = document.getElementById('gallery');
  const img = document.createElement('img');
  img.src = 'data:image/jpeg;base64,' + p.b64;
  img.style.width = '150px'; img.style.margin='4px'; img.style.borderRadius='8px';
  g.appendChild(img);
}

document.getElementById('createSession').addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'createSession' }));
});

document.getElementById('uploadAll').addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'uploadToImgBB', payload: { sessionId } }));
});

document.getElementById('finalizar').addEventListener('click', () => {
  ws.send(JSON.stringify({ type: 'finalizar', payload: { sessionId } }));
});

document.getElementById('clearGallery').addEventListener('click', ()=>{ document.getElementById('gallery').innerHTML=''; fotos.clear(); log('Galeria limpa manualmente'); });
