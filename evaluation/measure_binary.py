import os
import subprocess
import pandas as pd

def measure_binary():
    # Build release stripped
    os.chdir("../rts_core")
    subprocess.run(["cargo", "build", "--release"], check=True)
    
    # In this environment, we might not have a shared lib or executable directly 
    # but we can check the target directory for artifacts.
    # For a library, it might be librts_core.rlib or .so
    
    artifacts = []
    target_dir = "target/release"
    for f in os.listdir(target_dir):
        if f.startswith("librts_core") and (f.endswith(".so") or f.endswith(".rlib")):
            path = os.path.join(target_dir, f)
            size = os.path.getsize(path)
            
            # Try to strip if it's a shared lib
            if f.endswith(".so"):
                subprocess.run(["strip", path])
                size = os.path.getsize(path)
                
            artifacts.append({"file": f, "size_bytes": size})
    
    df = pd.DataFrame(artifacts)
    df.to_csv("../results/binary_sizes.csv", index=False)
    print("Binary sizes measured.")

if __name__ == "__main__":
    measure_binary()
