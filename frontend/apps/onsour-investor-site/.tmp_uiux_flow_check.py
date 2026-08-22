import json
import os
import subprocess
import time
import urllib.request
import urllib.parse
import websocket

BASE = "http://127.0.0.1:3000/docs"
DEBUG_PORT = 9223
fixture_path = "/tmp/onsour-uiux-e2e-graph.json"
name = f"ui-ux-e2e-{int(time.time())}"
with open(fixture_path, "w", encoding="utf-8") as f:
    json.dump({
        "name": name,
        "current_nodes": [
            {"id": "n0", "theta": 0.10},
            {"id": "n1", "theta": 0.20},
            {"id": "n2", "theta": 0.30},
        ],
        "candidate_nodes": [
            {"id": "n0", "theta": 0.11},
            {"id": "n1", "theta": 0.21},
            {"id": "n2", "theta": 0.31},
        ],
        "edges": [
            {"src": "n0", "dst": "n1", "weight": 0.1},
            {"src": "n1", "dst": "n2", "weight": 0.1},
        ],
    }, f)

proc = subprocess.Popen([
    "chromium", "--headless=new", "--no-sandbox", "--disable-gpu",
    f"--remote-debugging-port={DEBUG_PORT}", "--remote-allow-origins=*", "--user-data-dir=/tmp/onsour-uiux-cdp",
    "about:blank",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    for _ in range(40):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{DEBUG_PORT}/json/list", timeout=1) as resp:
                tabs = json.load(resp)
            if tabs:
                break
        except Exception:
            time.sleep(0.25)
    tab = tabs[0]
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], timeout=5)
    counter = 0

    def cdp(method, params=None):
        nonlocal_counter = None
        global counter
        counter += 1
        ws.send(json.dumps({"id": counter, "method": method, "params": params or {}}))
        while True:
            message = json.loads(ws.recv())
            if message.get("id") == counter:
                return message.get("result", {})

    cdp("Page.enable")
    cdp("Runtime.enable")
    cdp("Page.navigate", {"url": BASE})
    time.sleep(2.5)

    def text():
        result = cdp("Runtime.evaluate", {"expression": "document.body.innerText", "returnByValue": True})
        return result.get("result", {}).get("value", "")

    cdp("DOM.enable")
    doc = cdp("DOM.getDocument")
    root_id = doc["root"]["nodeId"]
    input_node = cdp("DOM.querySelector", {"nodeId": root_id, "selector": "input[type=file]"})["nodeId"]
    cdp("DOM.setFileInputFiles", {"nodeId": input_node, "files": [fixture_path]})
    cdp("Runtime.evaluate", {"expression": "document.querySelector('input[type=file]').dispatchEvent(new Event('change', {bubbles:true}))"})

    loaded = False
    for _ in range(30):
        body = text()
        if name in body and "LOADED GRAPH" in body:
            loaded = True
            break
        time.sleep(0.25)
    if not loaded:
        raise RuntimeError("upload/analyze state did not appear")

    cdp("Runtime.evaluate", {"expression": "[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Save to DB'))?.click()"})
    saved = False
    for _ in range(40):
        body = text()
        if "Saved to database successfully." in body and name in body:
            saved = True
            break
        time.sleep(0.25)
    if not saved:
        raise RuntimeError("database save confirmation did not appear")

    cdp("Runtime.evaluate", {"expression": "[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Reload into lab'))?.click()"})
    reloaded = False
    for _ in range(20):
        body = text()
        if name in body and "LOADED GRAPH" in body:
            reloaded = True
            break
        time.sleep(0.25)
    if not reloaded:
        raise RuntimeError("reload into lab state did not appear")

    print(json.dumps({"name": name, "uploaded": loaded, "saved": saved, "reloaded": reloaded}))
finally:
    try:
        ws.close()
    except Exception:
        pass
    proc.terminate()
    proc.wait(timeout=5)
