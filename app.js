const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");

const history = [
  { role: "system", content: CONFIG.SYSTEM_PROMPT }
];

function addMessage(text, type){
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

function addTyping(){
  const div = document.createElement("div");
  div.className = "msg ai typing";
  div.textContent = "NEURO-X sedang berpikir...";
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

async function sendMessage(){
  const text = inputEl.value.trim();
  if(!text) return;

  addMessage(text, "user");
  history.push({ role: "user", content: text });

  inputEl.value = "";
  inputEl.style.height = "auto";
  sendBtn.disabled = true;

  const typingEl = addTyping();

  try{
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: history,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if(!res.ok){
      const err = await res.text();
      throw new Error(`HTTP ${res.status} — ${err}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "(kosong)";

    typingEl.remove();
    addMessage(reply, "ai");
    history.push({ role: "assistant", content: reply });

  }catch(err){
    typingEl.remove();
    addMessage(`⚠️ Error: ${err.message}\n\nCek API key di config.js atau koneksi internet.`, "ai");
  }finally{
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
});

inputEl.focus();