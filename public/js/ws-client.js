/*
  ws-client.js
  Cliente WebSocket simples para cabine fotográfica.
  Funciona em qualquer HTML, sem export/import.
*/
(function(global){
  function Emitter(){ this.listeners = {}; }
  Emitter.prototype.on = function(k, fn){ (this.listeners[k]||(this.listeners[k]=[])).push(fn); };
  Emitter.prototype.emit = function(k, ...a){ (this.listeners[k]||[]).forEach(f=>f(...a)); };

  function create(opts){
    opts = opts || {};
    const WS_URL = opts.url || "wss://render-p6l0.onrender.com"; // Render URL
    const role = opts.role || null;
    const sessionId = opts.sessionId || null;

    const em = new Emitter();
    let ws = null;
    let shouldReconnect = true;
    let pingTimer = null;

    function connect(){
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        em.emit('open');
        if(role) ws.send(JSON.stringify({ type:'joinSession', payload:{ sessionId, role } }));
        startPing();
      };
      ws.onmessage = (ev) => {
        try{ const msg = JSON.parse(ev.data); em.emit('message', msg); }catch(e){}
      };
      ws.onclose = () => { em.emit('close'); stopPing(); if(shouldReconnect) setTimeout(connect,1500); };
      ws.onerror = (err) => em.emit('error', err);
    }

    function startPing(){ stopPing(); pingTimer=setInterval(()=>{ try{ if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({type:'ping'})); }catch(e){} },25000); }
    function stopPing(){ if(pingTimer){ clearInterval(pingTimer); pingTimer=null; } }

    connect();

    return {
      on: em.on.bind(em),
      emitEvent: em.emit.bind(em),
      send: function(obj){ if(ws && ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify(obj)); },
      close: function(){ shouldReconnect=false; try{ ws.close(); }catch(e){} },
      raw: function(){ return ws; }
    };
  }

  global.CabineWS = { create };
})(window);
