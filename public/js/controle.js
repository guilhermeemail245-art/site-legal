// controle.js - Celular
const urlParams = new URLSearchParams(location.search);
const sessionId = urlParams.get('session');
const ws = CabineWS.create({ role:'user', sessionId });

const startBtn = document.getElementById('startBtn');
const camVideo = document.getElementById('camVideo');
let photoCount = 0;

startBtn.addEventListener('click', async ()=>{
  startBtn.style.display='none';
  await startCamera();
  takePhotosSequence();
});

async function startCamera(){
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user' } });
  camVideo.srcObject = stream;
  await camVideo.play();
}

function takePhotosSequence(){
  photoCount=0;
  const interval = setInterval(()=>{
    capturePhoto();
    photoCount++;
    if(photoCount>=3){ clearInterval(interval); ws.send({ type:'sessionEnd' }); startBtn.style.display='block'; }
  }, 3000);
}

function capturePhoto(){
  const canvas = document.createElement('canvas');
  canvas.width = camVideo.videoWidth;
  canvas.height = camVideo.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(camVideo,0,0,canvas.width,canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg',0.92);
  ws.send({ type:'photo', payload:{ url:dataUrl }});
}
