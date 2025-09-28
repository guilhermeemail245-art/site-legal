// ws-client.js
const WS_URL =
  location.hostname === "localhost"
    ? "ws://localhost:10000"
    : "wss://render-p6l0.onrender.com";

let socket;

function connect(sessionId, onMessage) {
  socket = new WebSocket(`${WS_URL}/?session=${sessionId}`);

  socket.onopen = () => console.log("🔗 WebSocket conectado");
  socket.onmessage = (event) => onMessage(JSON.parse(event.data));
  socket.onclose = () => {
    console.warn("⚠️ WebSocket desconectado, tentando reconectar...");
    setTimeout(() => connect(sessionId, onMessage), 3000);
  };
}

function send(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export { connect, send };
