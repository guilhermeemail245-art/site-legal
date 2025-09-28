/*
 visualizador.js
 - If query param 'u' exists (urls separated by |) it renders them.
 - Else, it can connect via WebSocket and listen for 'uploadResult' messages for a sessionId
   provided via ?session=<id>. The backend must send uploadResult with array of {id,url}.
*/
(function(){
  const params = new URLSearchParams(location.search);
  const u = params.get('u');
  const sessionId = params.get('session');
  const grid = document.getElementById('grid');

  function renderUrls(urls){
    grid.innerHTML = '';
    urls.forEach((url, i) => {
      const wrapper = document.createElement('div');
      wrapper.style.display='inline-block'; wrapper.style.margin='8px'; wrapper.style.textAlign='center';
      const img = document.createElement('img'); img.src = url; img.style.width = '220px'; img.style.borderRadius='8px'; img.alt = `foto_${i+1}`;
      const a = document.createElement('a'); a.href = url; a.download = `foto_${i+1}.jpg`; a.innerText = 'Download'; a.style.display='block'; a.style.marginTop='6px';
      wrapper.appendChild(img); wrapper.appendChild(a); grid.appendChild(wrapper);
    });
  }

  if (u) {
    const urls = decodeURIComponent(u).split('|').filter(Boolean);
    renderUrls(urls);
  } else if (sessionId) {
    // connect websocket and wait for uploadResult for this session
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = proto + '//' + location.host;
    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log('visualizador ws open');
      // join as viewer? backend doesn't require but we send joinSession for completeness
      ws.send(JSON.stringify({ type:'joinSession', payload:{ sessionId, role:'viewer' } }));
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'uploadResult' && msg.payload && Array.isArray(msg.payload.results)) {
          const urls = msg.payload.results.filter(r=>r.url).map(r=>r.url);
          if (urls.length) renderUrls(urls);
        }
      } catch(e){ console.error(e); }
    };
    ws.onclose = () => console.log('visualizador ws closed');
  } else {
    grid.innerText = 'Nenhuma foto disponível. Use ?u=url1|url2 ou ?session=SESSION_ID';
  }
})();
