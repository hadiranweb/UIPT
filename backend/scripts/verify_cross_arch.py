import json
import subprocess
import random
import os

FP_SHIFT = 32
FP_ONE = 1 << FP_SHIFT

def to_fp(f):
    return int(f * FP_ONE)

def from_fp(fp):
    return float(fp) / FP_ONE

def generate_test_data(num_nodes=100, num_edges=500):
    nodes = []
    for _ in range(num_nodes):
        nodes.append({
            "theta": to_fp(random.uniform(-1, 1)),
            "e": to_fp(random.uniform(0, 1)),
            "ec": to_fp(random.uniform(0.1, 0.5))
        })
    
    edges = []
    for _ in range(num_edges):
        edges.append({
            "src": random.randint(0, num_nodes - 1),
            "dst": random.randint(0, num_nodes - 1),
            "weight": to_fp(random.uniform(0.01, 0.1))
        })
    
    return {"nodes": nodes, "edges": edges, "steps": 10}

def run_native(data):
    binary = "/home/ubuntu/UIPT_repo/backend/target/debug/verify_math"
    process = subprocess.Popen([binary], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stdout, stderr = process.communicate(input=json.dumps(data))
    if process.returncode != 0:
        print(f"Native Error: {stderr}")
        return None
    return json.loads(stdout)

def run_wasm(data):
    cwd = "/home/ubuntu/UIPT_repo/backend/core/rts_wasm"
    process = subprocess.Popen(["node", "verify_wasm.js"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=cwd)
    stdout, stderr = process.communicate(input=json.dumps(data))
    if process.returncode != 0:
        print(f"WASM Error: {stderr}")
        return None
    return json.loads(stdout)

def compare(native, wasm):
    native_nodes = native["final_nodes"]
    wasm_nodes = wasm["final_nodes"]
    
    mismatches = 0
    max_diff = 0
    
    for i in range(len(native_nodes)):
        n = native_nodes[i]
        w = wasm_nodes[i]
        
        for key in ["theta", "e", "ec"]:
            # JSON might parse large ints as floats or strings in some environments, 
            # but Python's json.loads handles large ints correctly.
            diff = abs(int(n[key]) - int(w[key]))
            max_diff = max(max_diff, diff)
            if diff > 0:
                mismatches += 1
                
    return mismatches, max_diff

if __name__ == "__main__":
    print("Generating Fixed-Point Test Data (Q32.32)...")
    data = generate_test_data()
    
    print("Running Native (x86_64)...")
    native_res = run_native(data)
    
    print("Running WASM (Node.js)...")
    wasm_res = run_wasm(data)
    
    if native_res and wasm_res:
        print(f"Native Sample Node 0 theta: {native_res['final_nodes'][0]['theta']}")
        print(f"WASM Sample Node 0 theta:   {wasm_res['final_nodes'][0]['theta']}")
        
        mismatches, max_diff = compare(native_res, wasm_res)
        print(f"\n--- Results ---")
        print(f"Total Nodes: {len(data['nodes'])}")
        print(f"Total Mismatches: {mismatches}")
        print(f"Maximum Bit Difference: {max_diff}")
        
        if mismatches == 0:
            print("\nSUCCESS: ABSOLUTE ZERO-BIT DIFFERENCE verified between x86_64 and WASM!")
        else:
            print(f"\nFAILURE: Found {mismatches} bit differences. Max diff: {max_diff}")
            print("Divergence detected in Fixed-Point logic.")
