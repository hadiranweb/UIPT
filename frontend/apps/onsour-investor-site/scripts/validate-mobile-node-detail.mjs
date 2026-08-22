import fs from "node:fs";

const targetUrl = "https://3000-im4kp5kxfs269av1wo45n-4d842152.us2.manus.computer/docs";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getTarget() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetch("http://127.0.0.1:9222/json");
    const targets = await response.json();
    const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (page) return page;
    await sleep(100);
  }
  throw new Error("No Chromium page target available.");
}

const target = await getTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, (message) => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  return result.result?.value;
}

await command("Page.enable");
await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await command("Page.navigate", { url: targetUrl });
await sleep(1800);
const scrollInfo = await evaluate("(()=>{const canvas=document.querySelector('canvas[aria-label=\\\"Interactive uploaded graph network canvas\\\"]');const rows=[];let node=canvas;while(node){const s=getComputedStyle(node);rows.push({tag:node.tagName,cls:typeof node.className==='string'?node.className:'',scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,overflowY:s.overflowY,scrollTop:node.scrollTop});node=node.parentElement;}return rows;})()");
await evaluate("(()=>{document.documentElement.style.scrollBehavior='auto';document.body.style.scrollBehavior='auto';const canvas=document.querySelector('canvas[aria-label=\\\"Interactive uploaded graph network canvas\\\"]');if(!canvas)return null;let node=canvas.parentElement;while(node){const s=getComputedStyle(node);if(node.scrollHeight>node.clientHeight+20 && s.overflowY!=='visible'){const nr=node.getBoundingClientRect();const cr=canvas.getBoundingClientRect();node.scrollTop+=cr.top-nr.top-220;return {scroller:node.className,scrollTop:node.scrollTop};}node=node.parentElement;}const target=Math.max(0,canvas.getBoundingClientRect().top+window.scrollY-220);window.scrollTo({top:target,left:0,behavior:'auto'});document.documentElement.scrollTop=target;document.body.scrollTop=target;return {scroller:'window',target};})()");
await sleep(1200);

const before = await evaluate("({innerWidth:window.innerWidth,innerHeight:window.innerHeight,scrollY:window.scrollY,mobileMatch:window.matchMedia('(max-width: 700px)').matches,stageColumns:getComputedStyle(document.querySelector('.network-graph-stage')).gridTemplateColumns})");
const canvasRect = await evaluate("(()=>{const r=document.querySelector('canvas[aria-label=\"Interactive uploaded graph network canvas\"]')?.getBoundingClientRect();return r?{left:r.left,top:r.top,width:r.width,height:r.height}:null})()");
if (!canvasRect) throw new Error("Graph canvas was not found.");

const exportButtonsVisible = await evaluate("(()=>{const buttons=Array.from(document.querySelectorAll('.network-export-controls button'));return buttons.map(b=>({text:b.innerText,rect:b.getBoundingClientRect()}));})()");
const exportClicked = await evaluate("(()=>{const buttons=Array.from(document.querySelectorAll('.network-export-controls button'));if(buttons.length>=2){buttons[0].click();buttons[1].click();return true;}return false;})()");
await sleep(300);
const screenshot = await command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
fs.writeFileSync("/home/ubuntu/onsour-mobile-node-detail.png", Buffer.from(screenshot.data, "base64"));

console.log(JSON.stringify({ before, scrollInfo, canvasRect, exportButtonsVisible, exportClicked, screenshot: "/home/ubuntu/onsour-mobile-node-detail.png" }, null, 2));
socket.close();
