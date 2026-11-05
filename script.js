```javascript
// Mira: voice in -> Claude (via your server) -> voice out
const SERVER_URL = "http://YOUR-SERVER-ADDRESS:3000/chat"; // change this later

const statusEl = document.getElementById("status-display");
const outputEl = document.getElementById("output-area");
const core = document.querySelector(".pulsing-core");

let history = [];
let recognition;
let busy = false;

function setState(state, text) {
  document.body.className = state;
  statusEl.textContent = text;
}

function speak(text) {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.onend = resolve;
    u.onerror = resolve;
    setState("speaking", "Speaking...");
    speechSynthesis.speak(u);
  });
}

async function askClaude(userText) {
  history.push({ role: "user", content: userText });
  const res = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  const data = await res.json();
  history.push({ role: "assistant", content: data.reply });
  return data.reply;
}

async function handleSpeech(text) {
  busy = true;
  outputEl.textContent = "You: " + text;
  setState("thinking", "Thinking...");
  try {
    const reply = await askClaude(text);
    outputEl.textContent = reply;
    await speak(reply);
  } catch (e) {
    outputEl.textContent = "Connection problem: " + e.message;
    setState("idle", "Error");
  }
  busy = false;
  startListening();
}

function startListening() {
  if (busy) return;
  setState("listening", "Listening...");
  recognition.start();
}

function init() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    statusEl.textContent = "Speech recognition not supported. Use Chrome.";
    return;
  }
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    handleSpeech(text);
  };
  recognition.onerror = () => { if (!busy) setTimeout(startListening, 1000); };
  recognition.onend = () => { if (!busy) setTimeout(startListening, 300); };

  // Browsers require one tap before the mic and voice can start
  statusEl.textContent = "Tap the orb to wake Mira";
  core.addEventListener("click", () => {
    core.style.cursor = "default";
    speak("Mira online.").then(startListening);
  }, { once: true });
}

init();
```