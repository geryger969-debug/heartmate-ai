const $ = id => document.getElementById(id);
const CHAT_KEY = "heartmate-chat-v1";
const PROFILE_KEY = "heartmate-profile-v1";
const defaults = {companionName:"Alya",userName:"",personality:"hangat, playful, perhatian, dan sedikit jahil",style:"natural dan santai",stage:"baru saling mengenal",extra:""};
let profile = {...defaults};
let messages = [];
let busy = false;
let toastTimer;

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
}
function load() {
  try { profile = {...defaults, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")}; } catch {}
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    if (Array.isArray(saved)) messages = saved.filter(m => ["user","assistant"].includes(m.role) && typeof m.content === "string");
  } catch {}
  updateProfileUI(); render();
}
function persist() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)));
  } catch { toast("Penyimpanan browser penuh."); }
}
function updateProfileUI() {
  $("headerName").textContent = profile.companionName;
  $("avatar").textContent = profile.companionName.slice(0,1).toUpperCase();
  $("welcomeText").textContent = `Senang kamu mampir. Aku ${profile.companionName}. Mau cerita apa hari ini?`;
  $("messageInput").placeholder = `Ketik sesuatu untuk ${profile.companionName}…`;
}
function addBubble(role, content, typing=false) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "bubble-avatar";
  avatar.textContent = role === "user" ? "K" : "♡";
  const bubble = document.createElement("div");
  bubble.className = "bubble" + (typing ? " typing" : "");
  bubble.textContent = content;
  row.append(avatar,bubble); $("messages").append(row);
  $("chat").scrollTop = $("chat").scrollHeight;
  return bubble;
}
function render() {
  $("messages").replaceChildren();
  $("welcome").style.display = messages.length ? "none" : "block";
  messages.forEach(m => addBubble(m.role,m.content));
}
function setBusy(v) {
  busy = v; $("sendButton").disabled = v; $("messageInput").disabled = v;
  $("sendButton").textContent = v ? "…" : "↑";
}
function resize() {
  const el = $("messageInput"); el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight,160)+"px";
}
async function send(raw) {
  const content = raw.trim();
  if (!content || busy) return;
  $("welcome").style.display = "none";
  messages.push({role:"user",content}); addBubble("user",content); persist();
  $("messageInput").value = ""; resize();
  const bubble = addBubble("assistant",`${profile.companionName} sedang mengetik…`,true);
  setBusy(true); let answer = "";
  try {
    const response = await fetch("/api/chat",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        messages:messages.slice(-30),
        companion_name:profile.companionName,user_name:profile.userName,
        personality:profile.personality,conversation_style:profile.style,
        relationship_stage:profile.stage,extra_context:profile.extra
      })
    });
    if (!response.ok) {
      let detail = "Permintaan gagal.";
      try { detail = (await response.json()).detail || detail; } catch {}
      throw new Error(detail);
    }
    bubble.classList.remove("typing"); bubble.textContent = "";
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const {value,done} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value,{stream:true});
      const parts = buffer.split("\n\n"); buffer = parts.pop() || "";
      for (const part of parts) {
        if (part.startsWith("event: app_error")) {
          const line = part.split("\n").find(x=>x.startsWith("data:"));
          if (line) { try { throw new Error(JSON.parse(line.slice(5)).message); } catch(e) { if(e instanceof SyntaxError) continue; throw e; } }
        }
        const line = part.split("\n").find(x=>x.startsWith("data:"));
        if (!line) continue;
        try {
          const data = JSON.parse(line.slice(5).trim());
          if (data.text) { answer += data.text; bubble.textContent = answer; $("chat").scrollTop = $("chat").scrollHeight; }
        } catch {}
      }
    }
    if (!answer) answer = "Aku belum menerima jawaban. Coba kirim sekali lagi, ya.";
    bubble.textContent = answer; messages.push({role:"assistant",content:answer}); persist();
  } catch (error) {
    bubble.classList.remove("typing");
    bubble.textContent = `Ada kendala: ${error.message}`;
    messages.pop(); persist(); toast(error.message);
  } finally { setBusy(false); $("messageInput").focus(); }
}
function openProfile() {
  $("companionName").value = profile.companionName;
  $("userName").value = profile.userName;
  $("personality").value = profile.personality;
  $("style").value = profile.style;
  $("stage").value = profile.stage;
  $("extra").value = profile.extra;
  $("profileModal").hidden = false;
}
async function health() {
  try {
    const r=await fetch("/api/health"), d=await r.json();
    $("statusText").textContent=d.configured?`Terhubung · ${d.model}`:"API key belum dipasang";
    $("statusDot").classList.toggle("online",d.configured);
  } catch { $("statusText").textContent="Server tidak terhubung"; }
}
$("chatForm").addEventListener("submit",e=>{e.preventDefault();send($("messageInput").value);});
$("messageInput").addEventListener("input",resize);
$("messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("chatForm").requestSubmit();}});
$("newChat").addEventListener("click",()=>{if(busy)return;messages=[];persist();render();$("sidebar").classList.remove("open");});
$("profileOpen").addEventListener("click",openProfile); $("profileOpen2").addEventListener("click",openProfile);
$("closeModal").addEventListener("click",()=>$("profileModal").hidden=true);
$("profileModal").addEventListener("click",e=>{if(e.target===$("profileModal"))$("profileModal").hidden=true;});
$("saveProfile").addEventListener("click",()=>{
  profile={
    companionName:$("companionName").value.trim()||"Alya",
    userName:$("userName").value.trim(),
    personality:$("personality").value,style:$("style").value,
    stage:$("stage").value,extra:$("extra").value.trim()
  };
  persist();updateProfileUI();$("profileModal").hidden=true;toast("Karakter pasangan virtual diperbarui ♡");
});
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll("[data-message]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.message)));
load();health();
