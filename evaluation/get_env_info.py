import json
import platform
import subprocess
import os
from datetime import datetime

def get_env_info():
    info = {
        "cpu_model": subprocess.check_output("grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2", shell=True).decode().strip(),
        "architecture": platform.machine(),
        "physical_cores": int(subprocess.check_output("nproc --all", shell=True).decode().strip()),
        "logical_cores": int(subprocess.check_output("nproc", shell=True).decode().strip()),
        "ram_total": subprocess.check_output("free -h | grep Mem | awk '{print $2}'", shell=True).decode().strip(),
        "os_name": platform.system(),
        "kernel_version": platform.release(),
        "rustc_version": subprocess.check_output("rustc --version", shell=True).decode().strip(),
        "cargo_version": subprocess.check_output("cargo --version", shell=True).decode().strip(),
        "target_triple": subprocess.check_output("rustc -vV | grep host | cut -d' ' -f2", shell=True).decode().strip(),
        "build_profile": "release",
        "compiler_flags": os.getenv("RUSTFLAGS", ""),
        "container_or_vm": True,
        "benchmark_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    with open('../results/benchmark_environment.json', 'w') as f:
        json.dump(info, f, indent=2)
    print("Benchmark environment info saved.")

if __name__ == "__main__":
    get_env_info()
