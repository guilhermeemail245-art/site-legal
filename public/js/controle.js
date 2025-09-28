// Controle da captura no celular, conecta por WebSocket ao servidor e envia fotos em base64
const params = new URLSearchParams(location.search);
const sessionId = params.get('session') || null;
// DEFAULT: replace this with your backend wss URL in production
const BACKEND_WS = sessionStorage.getItem('backend_ws') || (location.origin.replace(/^http/, 'ws'));
let ws;

function connect() {
  ws = new WebSocket(BACKEND_WS);
  ws.onopen = () => console.log('ws open');
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === 'reset') {
      // voltar à tela inicial
      location.reload();
    }
  };
  ws.onclose = () => { console.log('ws closed, reconnecting in 2s'); setTimeout(connect,2000); };
}

async function startCamera() {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  video.srcObject = stream;
  await video.play();
  return video;
}

function captureImage(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const b64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
  return b64;
}

async function runSequence() {
  const video = await startCamera();
  const btn = document.getElementById('startBtn');
  btn.style.display = 'none';
  for (let i=0;i<3;i++) {
    const countdownEl = document.getElementById('countdown');
    countdownEl.style.display = 'block';
    for (let c=3;c>=1;c--) { countdownEl.innerText = c; await new Promise(r=>setTimeout(r,1000)); }
    countdownEl.style.display = 'none';
    const b64 = captureImage(video);
    // enviar ao servidor
    try { ws.send(JSON.stringify({ type: 'photo', payload: { sessionId, filename: `foto_${Date.now()}.jpg`, b64 } })); }
    catch(e){ console.error('ws send err', e); }
    await new Promise(r=>setTimeout(r,500));
  }
  // mostrar obrigado
  const div = document.createElement('div'); div.innerText='Obrigado por usar a cabine'; div.style.position='fixed'; div.style.left='50%'; div.style.top='20%'; div.style.transform='translateX(-50%)'; div.style.background='rgba(0,0,0,0.7)'; div.style.color='#fff'; div.style.padding='12px 18px'; div.style.borderRadius='8px'; document.body.appendChild(div);
}

window.addEventListener('load', async () => {
  connect();
  document.getElementById('startBtn').addEventListener('click', runSequence);
});
