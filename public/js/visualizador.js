// visualizador.js
const params = new URLSearchParams(location.search);
const u = params.get('u');
const sessionId = params.get('session');
const grid = document.getElementById('grid');

function renderUrls(urls){
  grid.innerHTML='';
  urls.forEach((url,i)=>{
    const div = document.createElement('div');
    div.style.display='inline-block';
    div.style.margin='8px';
    const img = document.createElement('img');
    img.src=url;
    img.style.width='220px';
    img.style.borderRadius='8px';
    const a = document.createElement('a');
    a.href=url;
    a.download=`foto_${i+1}.jpg`;
    a.innerText='Download';
    a.style.display='block';
    a.style.marginTop='4px';
    div.appendChild(img);
    div.appendChild(a);
    grid.appendChild(div);
  });
}

if(u){
  const urls = decodeURIComponent(u).split('|').filter(Boolean);
  renderUrls(urls);
}else if(sessionId){
  const proto = location.protocol==='https:'?'wss:':'ws:';
  const ws = new WebSocket("wss://render-p6l0.onrender.com");
  ws.onopen=()=>ws.send(JSON.stringify({ type:'joinSession', payload:{ sessionId, role:'viewer' }}));
  ws.onmessage=(ev)=>{
    try{
      const msg = JSON.parse(ev.data);
      if(msg.type==='uploadResult' && Array.isArray(msg.payload.results)){
        const urls = msg.payload.results.filter(r=>r.url).map(r=>r.url);
        if(urls.length) renderUrls(urls);
      }
    }catch(e){console.error(e);}
  };
}else{
  grid.innerText='Nenhuma foto disponível. Use ?u=url1|url2 ou ?session=SESSION_ID';
}
